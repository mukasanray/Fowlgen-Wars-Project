use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub authority: Pubkey,
    pub xp: u64,
    pub matches_played: u64,
    pub wins: u64,
}

#[account]
#[derive(InitSpace)]
pub struct GameConfig {
    pub server_authority: Pubkey,
}
