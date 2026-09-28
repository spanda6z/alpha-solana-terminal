use anchor_lang::prelude::*;
use alpha_shared::AlphaError;

declare_id!("5ERrEkhCCJtVY2USYDBTfYvG4RtZJXxAxnSMHkTGE5m7");

pub const STRATEGY_MARTINGALE: u8 = 5;

#[program]
pub mod martingale_bot {
    use super::*;

    pub fn initialize_martingale(
        ctx: Context<InitializeMartingale>,
        base_amount: u64,
        max_multiplier: u8,
        drop_trigger_bps: u16,
        take_profit_bps: u16,
        max_slippage_bps: u16,
    ) -> Result<()> {
        require!(base_amount > 0, AlphaError::InvalidAmount);
        require!(max_multiplier >= 1 && max_multiplier <= 6, AlphaError::InvalidParams);
        require!(drop_trigger_bps > 0 && drop_trigger_bps <= 3000, AlphaError::InvalidParams);
        require!(take_profit_bps > 0, AlphaError::InvalidParams);

        let m = &mut ctx.accounts.martingale_config;
        m.bot = ctx.accounts.bot_header.key();
        m.owner = ctx.accounts.owner.key();
        m.base_mint = ctx.accounts.base_mint.key();
        m.quote_mint = ctx.accounts.quote_mint.key();
        m.base_amount = base_amount;
        m.max_multiplier = max_multiplier;
        m.current_multiplier = 1;
        m.drop_trigger_bps = drop_trigger_bps;
        m.take_profit_bps = take_profit_bps;
        m.max_slippage_bps = max_slippage_bps;
        m.cycles = 0;
        m.keeper = ctx.accounts.keeper.key();
        m.bump = ctx.bumps.martingale_config;

        Ok(())
    }

    pub fn execute_step(
        ctx: Context<ExecuteStep>,
        is_buy: bool,
        amount_in: u64,
        min_out: u64,
    ) -> Result<()> {
        let m = &mut ctx.accounts.martingale_config;
        require!(m.keeper == ctx.accounts.keeper.key(), AlphaError::InvalidKeeper);

        if is_buy {
            if m.current_multiplier < m.max_multiplier {
                m.current_multiplier = m.current_multiplier.saturating_add(1);
            }
        } else {
            m.current_multiplier = 1;
        }

        m.cycles = m.cycles.saturating_add(1);

        emit!(MartingaleStep {
            bot: m.bot,
            is_buy,
            amount_in,
            multiplier: m.current_multiplier,
            cycle: m.cycles,
        });

        Ok(())
    }

    pub fn cancel(ctx: Context<CancelMartingale>) -> Result<()> {
        require!(
            ctx.accounts.martingale_config.owner == ctx.accounts.owner.key(),
            AlphaError::Unauthorized
        );
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct MartingaleConfig {
    pub bot: Pubkey,
    pub owner: Pubkey,
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub base_amount: u64,
    pub max_multiplier: u8,
    pub current_multiplier: u8,
    pub drop_trigger_bps: u16,
    pub take_profit_bps: u16,
    pub max_slippage_bps: u16,
    pub cycles: u32,
    pub keeper: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeMartingale<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Bot header
    pub bot_header: UncheckedAccount<'info>,
    /// CHECK: Base
    pub base_mint: UncheckedAccount<'info>,
    /// CHECK: Quote
    pub quote_mint: UncheckedAccount<'info>,
    /// CHECK: Keeper
    pub keeper: UncheckedAccount<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + MartingaleConfig::INIT_SPACE,
        seeds = [b"martingale", bot_header.key().as_ref()],
        bump
    )]
    pub martingale_config: Account<'info, MartingaleConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteStep<'info> {
    pub keeper: Signer<'info>,
    #[account(
        mut,
        seeds = [b"martingale", martingale_config.bot.as_ref()],
        bump = martingale_config.bump
    )]
    pub martingale_config: Account<'info, MartingaleConfig>,
}

#[derive(Accounts)]
pub struct CancelMartingale<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"martingale", martingale_config.bot.as_ref()],
        bump = martingale_config.bump,
        has_one = owner @ AlphaError::Unauthorized
    )]
    pub martingale_config: Account<'info, MartingaleConfig>,
}

#[event]
pub struct MartingaleStep {
    pub bot: Pubkey,
    pub is_buy: bool,
    pub amount_in: u64,
    pub multiplier: u8,
    pub cycle: u32,
}
