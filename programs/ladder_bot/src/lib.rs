use anchor_lang::prelude::*;
use alpha_shared::AlphaError;

declare_id!("2GZGjRr7SarumQX3n6BeAw3rBsfcrjkwPjJzoRui3fYg");

pub const STRATEGY_LADDER: u8 = 4;

#[program]
pub mod ladder_bot {
    use super::*;

    /// Ladder: place multiple buy limit levels below current price
    pub fn initialize_ladder(
        ctx: Context<InitializeLadder>,
        levels: u8,                 // number of rungs (2-20)
        drop_bps_per_level: u16,    // how much lower each level is (e.g. 200 = 2%)
        amount_per_level: u64,
        max_slippage_bps: u16,
    ) -> Result<()> {
        require!(levels >= 2 && levels <= 20, AlphaError::InvalidParams);
        require!(drop_bps_per_level > 0 && drop_bps_per_level <= 2000, AlphaError::InvalidParams);
        require!(amount_per_level > 0, AlphaError::InvalidAmount);

        let ladder = &mut ctx.accounts.ladder_config;
        ladder.bot = ctx.accounts.bot_header.key();
        ladder.owner = ctx.accounts.owner.key();
        ladder.base_mint = ctx.accounts.base_mint.key();
        ladder.quote_mint = ctx.accounts.quote_mint.key();
        ladder.levels = levels;
        ladder.drop_bps_per_level = drop_bps_per_level;
        ladder.amount_per_level = amount_per_level;
        ladder.max_slippage_bps = max_slippage_bps;
        ladder.filled_levels = 0;
        ladder.keeper = ctx.accounts.keeper.key();
        ladder.bump = ctx.bumps.ladder_config;

        Ok(())
    }

    pub fn fill_rung(ctx: Context<FillRung>, level: u8, amount_in: u64, min_out: u64) -> Result<()> {
        let ladder = &mut ctx.accounts.ladder_config;
        require!(ladder.keeper == ctx.accounts.keeper.key(), AlphaError::InvalidKeeper);
        require!(level < ladder.levels, AlphaError::InvalidParams);

        ladder.filled_levels = ladder.filled_levels.saturating_add(1);

        emit!(LadderRungFilled {
            bot: ladder.bot,
            level,
            amount_in,
            min_out,
        });

        Ok(())
    }

    pub fn cancel(ctx: Context<CancelLadder>) -> Result<()> {
        require!(
            ctx.accounts.ladder_config.owner == ctx.accounts.owner.key(),
            AlphaError::Unauthorized
        );
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct LadderConfig {
    pub bot: Pubkey,
    pub owner: Pubkey,
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub levels: u8,
    pub drop_bps_per_level: u16,
    pub amount_per_level: u64,
    pub max_slippage_bps: u16,
    pub filled_levels: u8,
    pub keeper: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeLadder<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Bot header
    pub bot_header: UncheckedAccount<'info>,
    /// CHECK: Base mint
    pub base_mint: UncheckedAccount<'info>,
    /// CHECK: Quote mint
    pub quote_mint: UncheckedAccount<'info>,
    /// CHECK: Keeper
    pub keeper: UncheckedAccount<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + LadderConfig::INIT_SPACE,
        seeds = [b"ladder", bot_header.key().as_ref()],
        bump
    )]
    pub ladder_config: Account<'info, LadderConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FillRung<'info> {
    pub keeper: Signer<'info>,
    #[account(
        mut,
        seeds = [b"ladder", ladder_config.bot.as_ref()],
        bump = ladder_config.bump
    )]
    pub ladder_config: Account<'info, LadderConfig>,
}

#[derive(Accounts)]
pub struct CancelLadder<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"ladder", ladder_config.bot.as_ref()],
        bump = ladder_config.bump,
        has_one = owner @ AlphaError::Unauthorized
    )]
    pub ladder_config: Account<'info, LadderConfig>,
}

#[event]
pub struct LadderRungFilled {
    pub bot: Pubkey,
    pub level: u8,
    pub amount_in: u64,
    pub min_out: u64,
}
