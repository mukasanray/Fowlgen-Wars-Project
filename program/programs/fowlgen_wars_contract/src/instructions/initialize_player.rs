use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(
        init,
        payer = player_authority,
        space = 8 + Player::INIT_SPACE,
        seeds = [PLAYER_SEED, player_authority.key().as_ref()],
        bump
    )]
    pub player: Account<'info, Player>,
    
    #[account(mut)]
    pub player_authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
    let player = &mut ctx.accounts.player;
    player.authority = ctx.accounts.player_authority.key();
    player.xp = 0;
    player.matches_played = 0;
    player.wins = 0;
    Ok(())
}
