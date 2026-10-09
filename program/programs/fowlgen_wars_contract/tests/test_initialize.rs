use {
    anchor_lang::{
        prelude::Pubkey,
        solana_program::{instruction::Instruction, system_program},
        AccountDeserialize, InstructionData, ToAccountMetas,
    },
    litesvm::LiteSVM,
    solana_keypair::Keypair,
    solana_message::{Message, VersionedMessage},
    solana_signer::Signer,
    solana_transaction::versioned::VersionedTransaction,
};

#[test]
fn test_recompensas() {
    let program_id = fowlgen_wars_contract::id();
    let admin = Keypair::new();
    let server_authority = Keypair::new();
    let player_wallet = Keypair::new();

    let mut svm = LiteSVM::new();
    let bytes = include_bytes!(concat!(
        env!("CARGO_TARGET_TMPDIR"),
        "/../deploy/fowlgen_wars_contract.so"
    ));
    svm.add_program(program_id, bytes).unwrap();
    svm.airdrop(&admin.pubkey(), 1_000_000_000).unwrap();
    svm.airdrop(&player_wallet.pubkey(), 1_000_000_000).unwrap();
    svm.airdrop(&server_authority.pubkey(), 1_000_000_000)
        .unwrap();

    let game_config_pda = Pubkey::find_program_address(
        &[fowlgen_wars_contract::constants::GAME_CONFIG_SEED],
        &program_id,
    )
    .0;

    // 1. Initialize Game Config
    let init_config_ix = Instruction::new_with_bytes(
        program_id,
        &fowlgen_wars_contract::instruction::InitializeGameConfig {
            server_authority: server_authority.pubkey(),
        }
        .data(),
        fowlgen_wars_contract::accounts::InitializeGameConfig {
            game_config: game_config_pda,
            admin: admin.pubkey(),
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[init_config_ix], Some(&admin.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&admin]).unwrap();
    assert!(svm.send_transaction(tx).is_ok());

    // 2. Initialize Player
    let player_pda = Pubkey::find_program_address(
        &[
            fowlgen_wars_contract::constants::PLAYER_SEED,
            player_wallet.pubkey().as_ref(),
        ],
        &program_id,
    )
    .0;

    let init_player_ix = Instruction::new_with_bytes(
        program_id,
        &fowlgen_wars_contract::instruction::InitializePlayer {}.data(),
        fowlgen_wars_contract::accounts::InitializePlayer {
            player: player_pda,
            player_authority: player_wallet.pubkey(),
            system_program: system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg =
        Message::new_with_blockhash(&[init_player_ix], Some(&player_wallet.pubkey()), &blockhash);
    let tx =
        VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&player_wallet]).unwrap();
    assert!(svm.send_transaction(tx).is_ok());

    // 3. Claim Reward (Authorized by Server)
    let claim_reward_ix = Instruction::new_with_bytes(
        program_id,
        &fowlgen_wars_contract::instruction::ClaimReward {
            xp_gained: 50,
            is_win: true,
        }
        .data(),
        fowlgen_wars_contract::accounts::ClaimReward {
            player: player_pda,
            player_authority: player_wallet.pubkey(),
            game_config: game_config_pda,
            server_authority: server_authority.pubkey(),
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(
        &[claim_reward_ix],
        Some(&server_authority.pubkey()),
        &blockhash,
    );
    let tx =
        VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[&server_authority]).unwrap();
    assert!(svm.send_transaction(tx).is_ok());

    // Check Player State
    let player_account = svm.get_account(&player_pda).unwrap();
    let mut data: &[u8] = &player_account.data;
    let player_state = fowlgen_wars_contract::state::Player::try_deserialize(&mut data).unwrap();

    assert_eq!(player_state.xp, 50);
    assert_eq!(player_state.matches_played, 1);
    assert_eq!(player_state.wins, 1);
}
