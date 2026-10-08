pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("7DaWGDQjEjJuUbejsNoqwy63m55p1rQ9UgMYrdsRxZ2U");

#[program]
pub mod fowlgen_wars_contract {
    use super::*;

    pub fn initialize_game_config(ctx: Context<InitializeGameConfig>, server_authority: Pubkey) -> Result<()> {
        crate::instructions::initialize_game_config::handle_initialize_game_config(ctx, server_authority)
    }

    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        crate::instructions::initialize_player::handle_initialize_player(ctx)
    }

    pub fn claim_reward(ctx: Context<ClaimReward>, xp_gained: u64, is_win: bool) -> Result<()> {
        crate::instructions::claim_reward::handle_claim_reward(ctx, xp_gained, is_win)
    }
}
