use crate::constants::*;
use crate::error::ErrorCode;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ClaimReward<'info> {
    #[account(
        mut,
        seeds = [PLAYER_SEED, player_authority.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,

    /// CHECK: We don't read or write data to this account. It's just the player's wallet.
    pub player_authority: UncheckedAccount<'info>,

    #[account(
        seeds = [GAME_CONFIG_SEED],
        bump
    )]
    pub game_config: Account<'info, GameConfig>,

    pub server_authority: Signer<'info>,
}

pub fn handle_claim_reward(ctx: Context<ClaimReward>, xp_gained: u64, is_win: bool) -> Result<()> {
    require!(
        ctx.accounts.server_authority.key() == ctx.accounts.game_config.server_authority,
        ErrorCode::UnauthorizedServer
    );

    let player = &mut ctx.accounts.player;
    player.xp = player.xp.checked_add(xp_gained).unwrap_or(player.xp);
    player.matches_played = player
        .matches_played
        .checked_add(1)
        .unwrap_or(player.matches_played);

    if is_win {
        player.wins = player.wins.checked_add(1).unwrap_or(player.wins);
    }

    Ok(())
}
