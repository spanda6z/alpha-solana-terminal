use anchor_lang::prelude::*;
use alpha_shared::{AlphaError, BotStatus};

declare_id!("2qJXqHk8QkRr85FXqStz3g67KvDi2CnVeUkK2v6ZwZ2e");

pub const STRATEGY_SHADOW: u8 = 3;

#[program]
pub mod shadow_bot {
    use super::*;

    pub fn initialize_shadow(
        ctx: Context<InitializeShadow>,
        target_wallet: Pubkey,
        max_position_size: u64,
        copy_ratio_bps: u16,
        max_slippage_bps: u16,
        only_buys: bool,
    ) -> Result<()> {
        require!(copy_ratio_bps > 0 && copy_ratio_bps <= 10_000, AlphaError::InvalidParams);
        require!(max_position_size > 0, AlphaError::InvalidAmount);
        require!(max_slippage_bps <= 1000, AlphaError::InvalidParams);

        let shadow = &mut ctx.accounts.shadow_config;
        shadow.bot = ctx.accounts.bot_header.key();
        shadow.owner = ctx.accounts.owner.key();
        shadow.target_wallet = target_wallet;
        shadow.max_position_size = max_position_size;
        shadow.copy_ratio_bps = copy_ratio_bps;
        shadow.max_slippage_bps = max_slippage_bps;
        shadow.only_buys = only_buys;
        shadow.mirrored_trades = 0;
        shadow.total_volume = 0;
        shadow.keeper = ctx.accounts.keeper.key();
        shadow.bump = ctx.bumps.shadow_config;

        Ok(())
    }

    pub fn mirror_trade(
        ctx: Context<MirrorTrade>,
        is_buy: bool,
        amount_in: u64,
        min_out: u64,
        target_tx_signature: [u8; 64],
    ) -> Result<()> {
        let shadow = &mut ctx.accounts.shadow_config;
        require!(shadow.keeper == ctx.accounts.keeper.key(), AlphaError::InvalidKeeper);

        if shadow.only_buys && !is_buy {
            return err!(AlphaError::InvalidParams);
        }

        let size = std::cmp::min(amount_in, shadow.max_position_size);
        shadow.mirrored_trades = shadow.mirrored_trades.saturating_add(1);
        shadow.total_volume = shadow.total_volume.saturating_add(size);

        emit!(TradeMirrored {
            bot: shadow.bot,
            target: shadow.target_wallet,
            is_buy,
            amount: size,
            mirrored_count: shadow.mirrored_trades,
        });

        Ok(())
    }

    pub fn update_target(ctx: Context<UpdateTarget>, new_target: Pubkey) -> Result<()> {
        require!(
            ctx.accounts.shadow_config.owner == ctx.accounts.owner.key(),
            AlphaError::Unauthorized
        );
        ctx.accounts.shadow_config.target_wallet = new_target;
        Ok(())
    }

    pub fn cancel(ctx: Context<CancelShadow>) -> Result<()> {
        require!(
            ctx.accounts.shadow_config.owner == ctx.accounts.owner.key(),
            AlphaError::Unauthorized
        );
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct ShadowConfig {
    pub bot: Pubkey,
    pub owner: Pubkey,
    pub target_wallet: Pubkey,
    pub max_position_size: u64,
    pub copy_ratio_bps: u16,
    pub max_slippage_bps: u16,
    pub only_buys: bool,
    pub mirrored_trades: u32,
    pub total_volume: u64,
    pub keeper: Pubkey,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct InitializeShadow<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Bot header
    pub bot_header: UncheckedAccount<'info>,
    /// CHECK: Keeper
    pub keeper: UncheckedAccount<'info>,
    #[account(
        init,
        payer = owner,
        space = 8 + ShadowConfig::INIT_SPACE,
        seeds = [b"shadow", bot_header.key().as_ref()],
        bump
    )]
    pub shadow_config: Account<'info, ShadowConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MirrorTrade<'info> {
    pub keeper: Signer<'info>,
    #[account(
        mut,
        seeds = [b"shadow", shadow_config.bot.as_ref()],
        bump = shadow_config.bump
    )]
    pub shadow_config: Account<'info, ShadowConfig>,
}

#[derive(Accounts)]
pub struct UpdateTarget<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"shadow", shadow_config.bot.as_ref()],
        bump = shadow_config.bump,
        has_one = owner @ AlphaError::Unauthorized
    )]
    pub shadow_config: Account<'info, ShadowConfig>,
}

#[derive(Accounts)]
pub struct CancelShadow<'info> {
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [b"shadow", shadow_config.bot.as_ref()],
        bump = shadow_config.bump,
        has_one = owner @ AlphaError::Unauthorized
    )]
    pub shadow_config: Account<'info, ShadowConfig>,
}

#[event]
pub struct TradeMirrored {
    pub bot: Pubkey,
    pub target: Pubkey,
    pub is_buy: bool,
    pub amount: u64,
    pub mirrored_count: u32,
}
