use anchor_lang::prelude::*;
use alpha_shared::{AlphaError, BotStatus};

declare_id!("GU843f7sYg6oBofypdvbSdFFXhWR7fQucq3DRtbcWy6Z");

pub const STRATEGY_GRID: u8 = 1;
pub const STRATEGY_INFINITY_GRID: u8 = 2;

#[program]
pub mod grid_bot {
    use super::*;

    /// Initialize a classic or infinity grid
    pub fn initialize_grid(
        ctx: Context<InitializeGrid>,
        lower_price: u64,
        upper_price: u64,
        grid_count: u16,
        amount_per_grid: u64,
        is_infinity: bool,
        max_slippage_bps: u16,
    ) -> Result<()> {
        require!(lower_price < upper_price, AlphaError::InvalidParams);
        require!(grid_count >= 2 && grid_count <= 200, AlphaError::InvalidParams);
        require!(amount_per_grid > 0, AlphaError::InvalidAmount);
        require!(max_slippage_bps <= 1000, AlphaError::InvalidParams);

        let grid = &mut ctx.accounts.grid_config;
        grid.bot = ctx.accounts.bot_header.key();
        grid.owner = ctx.accounts.owner.key();
        grid.base_mint = ctx.accounts.base_mint.key();
        grid.quote_mint = ctx.accounts.quote_mint.key();
        grid.lower_price = lower_price;
        grid.upper_price = upper_price;
        grid.grid_count = grid_count;
        grid.amount_per_grid = amount_per_grid;
        grid.is_infinity = is_infinity;
        grid.max_slippage_bps = max_slippage_bps;
        grid.filled_buys = 0;
        grid.filled_sells = 0;
        grid.keeper = ctx.accounts.keeper.key();
        grid.bump = ctx.bumps.grid_config;

        Ok(())
    }

    pub fn fill_level(
        ctx: Context<FillLevel>,
        level_index: u16,
        is_buy: bool,
        amount_in: u64,
        min_out: u64,
    ) -> Result<()> {
        let grid = &mut ctx.accounts.grid_config;
        require!(grid.keeper == ctx.accounts.keeper.key(), AlphaError::InvalidKeeper);
        require!(level_index < grid.grid_count, AlphaError::InvalidParams);

        if is_buy {
            grid.filled_buys = grid.filled_buys.saturating_add(1);
        } else {
            grid.filled_sells = grid.filled_sells.saturating_add(1);
        }

        emit!(GridLevelFilled {
            bot: grid.bot,
            level: level_index,
            is_buy,
            amount_in,
            min_out,
        });

        Ok(())
    }

    pub fn cancel(ctx: Context<CancelGrid>) -> Result<()> {
        require!(
            ctx.accounts.grid_config.owner == ctx.accounts.owner.key(),
            AlphaError::Unauthorized
        );
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct GridConfig {
    pub bot: Pubkey,
    pub owner: Pubkey,
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub lower_price: u64,
    pub upper_price: u64,
    pub grid_count: u16,
    pub amount_per_grid: u64,
    pub is_infinity: bool,
    pub max_slippage_bps: u16,
    pub filled_buys: u32,
    pub filled_sells: u32,
    pub keeper: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeGrid<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Bot header from bot_core
    pub bot_header: UncheckedAccount<'info>,
    /// CHECK: Base token
    pub base_mint: UncheckedAccount<'info>,
    /// CHECK: Quote token
    pub quote_mint: UncheckedAccount<'info>,
    /// CHECK: Authorized keeper
    pub keeper: UncheckedAccount<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + GridConfig::INIT_SPACE,
        seeds = [b"grid", bot_header.key().as_ref()],
        bump
    )]
    pub grid_config: Account<'info, GridConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FillLevel<'info> {
    pub keeper: Signer<'info>,
    #[account(
        mut,
        seeds = [b"grid", grid_config.bot.as_ref()],
        bump = grid_config.bump
    )]
    pub grid_config: Account<'info, GridConfig>,
}

#[derive(Accounts)]
pub struct CancelGrid<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"grid", grid_config.bot.as_ref()],
        bump = grid_config.bump,
        has_one = owner @ AlphaError::Unauthorized
    )]
    pub grid_config: Account<'info, GridConfig>,
}

#[event]
pub struct GridLevelFilled {
    pub bot: Pubkey,
    pub level: u16,
    pub is_buy: bool,
    pub amount_in: u64,
    pub min_out: u64,
}
