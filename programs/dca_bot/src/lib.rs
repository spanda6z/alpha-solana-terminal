use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};
use alpha_shared::{constants::*, AlphaError, BotStatus};

declare_id!("Au1TvdD1sS6Tb1HsGebz8KRqMXqBK5N7tkREBWBkUDid");

/// Strategy ID for DCA
pub const STRATEGY_DCA: u8 = 0;

#[program]
pub mod dca_bot {
    use super::*;

    /// Initialize a DCA bot with parameters
    pub fn initialize_dca(
        ctx: Context<InitializeDca>,
        amount_per_cycle: u64,
        interval_seconds: i64,
        total_cycles: u32,
        max_slippage_bps: u16,
    ) -> Result<()> {
        require!(amount_per_cycle > 0, AlphaError::InvalidAmount);
        require!(interval_seconds >= 60, AlphaError::InvalidParams); // min 1 min
        require!(total_cycles > 0 && total_cycles <= 10_000, AlphaError::InvalidParams);
        require!(max_slippage_bps <= 1000, AlphaError::InvalidParams); // max 10%

        let dca = &mut ctx.accounts.dca_config;
        dca.bot = ctx.accounts.bot_header.key();
        dca.owner = ctx.accounts.owner.key();
        dca.input_mint = ctx.accounts.input_mint.key();
        dca.output_mint = ctx.accounts.output_mint.key();
        dca.amount_per_cycle = amount_per_cycle;
        dca.interval_seconds = interval_seconds;
        dca.total_cycles = total_cycles;
        dca.executed_cycles = 0;
        dca.max_slippage_bps = max_slippage_bps;
        dca.next_execution_at = Clock::get()?.unix_timestamp + interval_seconds;
        dca.keeper = ctx.accounts.keeper.key();
        dca.bump = ctx.bumps.dca_config;

        Ok(())
    }

    /// Keeper executes one DCA cycle (buy)
    /// In production this would CPI into Jupiter. Here we just update state
    /// and leave the actual swap to the keeper / frontend for flexibility.
    pub fn execute_cycle(ctx: Context<ExecuteCycle>, amount_in: u64, min_out: u64) -> Result<()> {
        let dca = &mut ctx.accounts.dca_config;
        let clock = Clock::get()?;

        require!(dca.keeper == ctx.accounts.keeper.key(), AlphaError::InvalidKeeper);
        require!(
            ctx.accounts.bot_header.status == BotStatus::Active,
            AlphaError::BotNotActive
        );
        require!(
            clock.unix_timestamp >= dca.next_execution_at,
            AlphaError::InvalidParams
        );
        require!(
            dca.executed_cycles < dca.total_cycles,
            AlphaError::InvalidParams
        );
        require!(amount_in <= dca.amount_per_cycle, AlphaError::InvalidAmount);

        // In a full implementation the keeper would:
        // 1. CPI to Jupiter for the swap
        // 2. Collect fee via fee_router
        // 3. Update balances

        dca.executed_cycles = dca.executed_cycles.saturating_add(1);
        dca.next_execution_at = clock.unix_timestamp + dca.interval_seconds;

        emit!(DcaCycleExecuted {
            bot: dca.bot,
            cycle: dca.executed_cycles,
            amount_in,
            min_out,
            next_at: dca.next_execution_at,
        });

        Ok(())
    }

    /// Owner can cancel remaining cycles (funds stay in vault until withdraw)
    pub fn cancel(ctx: Context<CancelDca>) -> Result<()> {
        require!(
            ctx.accounts.dca_config.owner == ctx.accounts.owner.key(),
            AlphaError::Unauthorized
        );
        ctx.accounts.dca_config.total_cycles = ctx.accounts.dca_config.executed_cycles;
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct DcaConfig {
    pub bot: Pubkey,
    pub owner: Pubkey,
    pub input_mint: Pubkey,
    pub output_mint: Pubkey,
    pub amount_per_cycle: u64,
    pub interval_seconds: i64,
    pub total_cycles: u32,
    pub executed_cycles: u32,
    pub max_slippage_bps: u16,
    pub next_execution_at: i64,
    pub keeper: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeDca<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: Validated against bot_header
    pub bot_header: UncheckedAccount<'info>,

    /// CHECK: Input mint (e.g. USDC or SOL)
    pub input_mint: UncheckedAccount<'info>,

    /// CHECK: Output mint (the token being bought)
    pub output_mint: UncheckedAccount<'info>,

    /// Optional authorized keeper (can be a PDA or a trusted bot runner)
    /// CHECK: Just stored
    pub keeper: UncheckedAccount<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + DcaConfig::INIT_SPACE,
        seeds = [b"dca", bot_header.key().as_ref()],
        bump
    )]
    pub dca_config: Account<'info, DcaConfig>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteCycle<'info> {
    pub keeper: Signer<'info>,

    #[account(
        mut,
        seeds = [b"dca", dca_config.bot.as_ref()],
        bump = dca_config.bump
    )]
    pub dca_config: Account<'info, DcaConfig>,

    /// CHECK: The shared bot header
    pub bot_header: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CancelDca<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"dca", dca_config.bot.as_ref()],
        bump = dca_config.bump,
        has_one = owner @ AlphaError::Unauthorized
    )]
    pub dca_config: Account<'info, DcaConfig>,
}

#[event]
pub struct DcaCycleExecuted {
    pub bot: Pubkey,
    pub cycle: u32,
    pub amount_in: u64,
    pub min_out: u64,
    pub next_at: i64,
}
