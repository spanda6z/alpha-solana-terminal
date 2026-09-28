use anchor_lang::prelude::*;

/// Global constants for Alpha
pub mod constants {
    use super::*;

    /// Protocol fee in basis points (100 = 1%)
    pub const PROTOCOL_FEE_BPS: u16 = 100;

    /// Referral share of the fee (30% of fee goes to referrer)
    pub const REFERRAL_SHARE_BPS: u16 = 3000;

    /// Max fee that can ever be set (safety)
    pub const MAX_FEE_BPS: u16 = 300; // 3%

    /// Seeds
    pub const FEE_CONFIG_SEED: &[u8] = b"fee_config";
    pub const BOT_SEED: &[u8] = b"bot";
    pub const POSITION_SEED: &[u8] = b"position";
    pub const VAULT_SEED: &[u8] = b"vault";
}

/// Common errors used across programs
#[error_code]
pub enum AlphaError {
    #[msg("Fee exceeds maximum allowed")]
    FeeTooHigh,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Bot is not active")]
    BotNotActive,
    #[msg("Insufficient funds in vault")]
    InsufficientFunds,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Slippage exceeded")]
    SlippageExceeded,
    #[msg("Bot already closed")]
    BotClosed,
    #[msg("Invalid strategy parameters")]
    InvalidParams,
    #[msg("Keeper not authorized")]
    InvalidKeeper,
}

/// Fee configuration account
#[account]
#[derive(InitSpace)]
pub struct FeeConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub fee_bps: u16,
    pub referral_share_bps: u16,
    pub paused: bool,
    pub bump: u8,
}

impl FeeConfig {
    pub fn calculate_fee(&self, amount: u64) -> Result<(u64, u64)> {
        require!(!self.paused, AlphaError::Unauthorized);
        let fee = (amount as u128)
            .checked_mul(self.fee_bps as u128)
            .ok_or(AlphaError::Overflow)?
            .checked_div(10_000)
            .ok_or(AlphaError::Overflow)? as u64;
        let referral = (fee as u128)
            .checked_mul(self.referral_share_bps as u128)
            .ok_or(AlphaError::Overflow)?
            .checked_div(10_000)
            .ok_or(AlphaError::Overflow)? as u64;
        Ok((fee, referral))
    }
}

/// Shared bot status
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum BotStatus {
    Active,
    Paused,
    Closed,
}

/// Base bot header shared by all strategies
#[account]
#[derive(InitSpace)]
pub struct BotHeader {
    pub owner: Pubkey,
    pub strategy: u8,          // 0=DCA, 1=Grid, 2=Shadow, etc.
    pub status: BotStatus,
    pub created_at: i64,
    pub last_executed_at: i64,
    pub total_deposited: u64,
    pub total_withdrawn: u64,
    pub bump: u8,
}
