use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use alpha_shared::{constants::*, AlphaError, FeeConfig};

declare_id!("DDAspZPbRaaJKNXPuVtuQLiDEHGyJ3ASMUcMigLNvdxW");

#[program]
pub mod fee_router {
    use super::*;

    /// Initialize the global fee config. Called once by the authority.
    pub fn initialize(
        ctx: Context<Initialize>,
        fee_bps: u16,
        referral_share_bps: u16,
    ) -> Result<()> {
        require!(fee_bps <= MAX_FEE_BPS, AlphaError::FeeTooHigh);

        let config = &mut ctx.accounts.fee_config;
        config.authority = ctx.accounts.authority.key();
        config.treasury = ctx.accounts.treasury.key();
        config.fee_bps = fee_bps;
        config.referral_share_bps = referral_share_bps;
        config.paused = false;
        config.bump = ctx.bumps.fee_config;

        msg!("Fee router initialized: {} bps fee, {} bps referral share", fee_bps, referral_share_bps);
        Ok(())
    }

    /// Update fee parameters (authority only)
    pub fn update_fee(
        ctx: Context<UpdateFee>,
        fee_bps: u16,
        referral_share_bps: u16,
    ) -> Result<()> {
        require!(fee_bps <= MAX_FEE_BPS, AlphaError::FeeTooHigh);
        let config = &mut ctx.accounts.fee_config;
        config.fee_bps = fee_bps;
        config.referral_share_bps = referral_share_bps;
        Ok(())
    }

    /// Pause / unpause the fee router
    pub fn set_paused(ctx: Context<UpdateFee>, paused: bool) -> Result<()> {
        ctx.accounts.fee_config.paused = paused;
        Ok(())
    }

    /// Transfer authority
    pub fn transfer_authority(ctx: Context<TransferAuthority>, new_authority: Pubkey) -> Result<()> {
        ctx.accounts.fee_config.authority = new_authority;
        Ok(())
    }

    /// Collect fee from a trade amount.
    /// Called by the frontend or bot programs via CPI after a successful swap.
    /// Splits fee between treasury and optional referrer.
    pub fn collect_fee(ctx: Context<CollectFee>, amount: u64) -> Result<()> {
        let config = &ctx.accounts.fee_config;
        require!(!config.paused, AlphaError::Unauthorized);
        require!(amount > 0, AlphaError::InvalidAmount);

        let (fee, referral_amount) = config.calculate_fee(amount)?;

        if fee == 0 {
            return Ok(());
        }

        // Transfer fee from user (or intermediate account) to treasury
        let cpi_accounts = Transfer {
            from: ctx.accounts.from_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);

        // Only transfer the protocol portion to treasury first
        let protocol_portion = fee.saturating_sub(referral_amount);
        if protocol_portion > 0 {
            token::transfer(cpi_ctx, protocol_portion)?;
        }

        // If referrer is present and referral_amount > 0, send the rest
        if referral_amount > 0 {
            if let Some(referrer_ata) = &ctx.accounts.referrer_token_account {
                let cpi_accounts_ref = Transfer {
                    from: ctx.accounts.from_token_account.to_account_info(),
                    to: referrer_ata.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                };
                let cpi_ctx_ref = CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    cpi_accounts_ref,
                );
                token::transfer(cpi_ctx_ref, referral_amount)?;
            } else {
                // No referrer → everything goes to treasury
                let cpi_accounts2 = Transfer {
                    from: ctx.accounts.from_token_account.to_account_info(),
                    to: ctx.accounts.treasury_token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                };
                let cpi_ctx2 = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts2);
                token::transfer(cpi_ctx2, referral_amount)?;
            }
        }

        emit!(FeeCollected {
            payer: ctx.accounts.payer.key(),
            amount,
            fee,
            referral: referral_amount,
            mint: ctx.accounts.from_token_account.mint,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: Treasury wallet that receives protocol fees
    pub treasury: UncheckedAccount<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + FeeConfig::INIT_SPACE,
        seeds = [FEE_CONFIG_SEED],
        bump
    )]
    pub fee_config: Account<'info, FeeConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFee<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [FEE_CONFIG_SEED],
        bump = fee_config.bump,
        has_one = authority @ AlphaError::Unauthorized
    )]
    pub fee_config: Account<'info, FeeConfig>,
}

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [FEE_CONFIG_SEED],
        bump = fee_config.bump,
        has_one = authority @ AlphaError::Unauthorized
    )]
    pub fee_config: Account<'info, FeeConfig>,
}

#[derive(Accounts)]
pub struct CollectFee<'info> {
    pub payer: Signer<'info>,

    #[account(
        seeds = [FEE_CONFIG_SEED],
        bump = fee_config.bump
    )]
    pub fee_config: Account<'info, FeeConfig>,

    #[account(mut)]
    pub from_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,

    /// Optional referrer ATA. If present and valid, receives referral share.
    #[account(mut)]
    pub referrer_token_account: Option<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,
}

#[event]
pub struct FeeCollected {
    pub payer: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub referral: u64,
    pub mint: Pubkey,
}
