use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, CloseAccount};
use alpha_shared::{constants::*, AlphaError, BotHeader, BotStatus};

declare_id!("4Ao2LU3FdW2j2wkJAktPLxhAkPAgCpv1hZwnpTRJm9DC");

#[program]
pub mod bot_core {
    use super::*;

    pub fn create_bot(
        ctx: Context<CreateBot>,
        strategy: u8,
        initial_deposit: u64,
    ) -> Result<()> {
        require!(initial_deposit > 0, AlphaError::InvalidAmount);

        let header = &mut ctx.accounts.bot_header;
        header.owner = ctx.accounts.owner.key();
        header.strategy = strategy;
        header.status = BotStatus::Active;
        header.created_at = Clock::get()?.unix_timestamp;
        header.last_executed_at = 0;
        header.total_deposited = initial_deposit;
        header.total_withdrawn = 0;
        header.bump = ctx.bumps.bot_header;

        let cpi_accounts = Transfer {
            from: ctx.accounts.owner_token_account.to_account_info(),
            to: ctx.accounts.bot_vault.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, initial_deposit)?;

        emit!(BotCreated {
            bot: ctx.accounts.bot_header.key(),
            owner: ctx.accounts.owner.key(),
            strategy,
            amount: initial_deposit,
        });

        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, AlphaError::InvalidAmount);
        require!(
            ctx.accounts.bot_header.status == BotStatus::Active
                || ctx.accounts.bot_header.status == BotStatus::Paused,
            AlphaError::BotClosed
        );

        let cpi_accounts = Transfer {
            from: ctx.accounts.owner_token_account.to_account_info(),
            to: ctx.accounts.bot_vault.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        ctx.accounts.bot_header.total_deposited = ctx
            .accounts
            .bot_header
            .total_deposited
            .checked_add(amount)
            .ok_or(AlphaError::Overflow)?;

        Ok(())
    }

    pub fn withdraw_and_close(ctx: Context<WithdrawAndClose>) -> Result<()> {
        let header = &mut ctx.accounts.bot_header;
        require!(header.owner == ctx.accounts.owner.key(), AlphaError::Unauthorized);
        require!(header.status != BotStatus::Closed, AlphaError::BotClosed);

        let amount = ctx.accounts.bot_vault.amount;
        if amount > 0 {
            let seeds = &[
                BOT_SEED,
                header.owner.as_ref(),
                &[header.strategy],
                &[header.bump],
            ];
            let signer = &[&seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.bot_vault.to_account_info(),
                to: ctx.accounts.owner_token_account.to_account_info(),
                authority: ctx.accounts.bot_header.to_account_info(),
            };
            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
                signer,
            );
            token::transfer(cpi_ctx, amount)?;

            header.total_withdrawn = header
                .total_withdrawn
                .checked_add(amount)
                .ok_or(AlphaError::Overflow)?;
        }

        let seeds = &[
            BOT_SEED,
            header.owner.as_ref(),
            &[header.strategy],
            &[header.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_close = CloseAccount {
            account: ctx.accounts.bot_vault.to_account_info(),
            destination: ctx.accounts.owner.to_account_info(),
            authority: ctx.accounts.bot_header.to_account_info(),
        };
        let cpi_ctx_close = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_close,
            signer,
        );
        token::close_account(cpi_ctx_close)?;

        header.status = BotStatus::Closed;

        emit!(BotClosed {
            bot: ctx.accounts.bot_header.key(),
            owner: ctx.accounts.owner.key(),
            withdrawn: amount,
        });

        Ok(())
    }

    pub fn set_status(ctx: Context<SetStatus>, status: BotStatus) -> Result<()> {
        require!(
            ctx.accounts.bot_header.owner == ctx.accounts.owner.key(),
            AlphaError::Unauthorized
        );
        require!(status != BotStatus::Closed, AlphaError::InvalidParams);
        ctx.accounts.bot_header.status = status;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(strategy: u8)]
pub struct CreateBot<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key(),
        constraint = owner_token_account.mint == mint.key()
    )]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = owner,
        space = 8 + BotHeader::INIT_SPACE,
        seeds = [BOT_SEED, owner.key().as_ref(), &[strategy]],
        bump
    )]
    pub bot_header: Account<'info, BotHeader>,
    #[account(
        init,
        payer = owner,
        token::mint = mint,
        token::authority = bot_header,
        seeds = [VAULT_SEED, bot_header.key().as_ref()],
        bump
    )]
    pub bot_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [BOT_SEED, owner.key().as_ref(), &[bot_header.strategy]],
        bump = bot_header.bump,
        has_one = owner @ AlphaError::Unauthorized
    )]
    pub bot_header: Account<'info, BotHeader>,
    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key()
    )]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [VAULT_SEED, bot_header.key().as_ref()],
        bump
    )]
    pub bot_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawAndClose<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [BOT_SEED, owner.key().as_ref(), &[bot_header.strategy]],
        bump = bot_header.bump,
        has_one = owner @ AlphaError::Unauthorized
    )]
    pub bot_header: Account<'info, BotHeader>,
    #[account(
        mut,
        constraint = owner_token_account.owner == owner.key()
    )]
    pub owner_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [VAULT_SEED, bot_header.key().as_ref()],
        bump
    )]
    pub bot_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SetStatus<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [BOT_SEED, owner.key().as_ref(), &[bot_header.strategy]],
        bump = bot_header.bump,
        has_one = owner @ AlphaError::Unauthorized
    )]
    pub bot_header: Account<'info, BotHeader>,
}

#[event]
pub struct BotCreated {
    pub bot: Pubkey,
    pub owner: Pubkey,
    pub strategy: u8,
    pub amount: u64,
}

#[event]
pub struct BotClosed {
    pub bot: Pubkey,
    pub owner: Pubkey,
    pub withdrawn: u64,
}
