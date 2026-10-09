use crate::constants::*;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct InitializeGameConfig<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + GameConfig::INIT_SPACE,
        seeds = [GAME_CONFIG_SEED],
        bump
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_initialize_game_config(
    ctx: Context<InitializeGameConfig>,
    server_authority: Pubkey,
) -> Result<()> {
    let game_config = &mut ctx.accounts.game_config;
    game_config.server_authority = server_authority;
    Ok(())
}
