use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

declare_id!("RepBoardProgram11111111111111111111111111");

const COOLDOWN_PERIOD: i64 = 24 * 60 * 60; // 24 hours in seconds
const DECAY_RATE: u16 = 1000; // 10% = 1000 basis points
const WEEK_IN_SECONDS: i64 = 7 * 24 * 60 * 60;

#[program]
pub mod reputation_board {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        admin: Pubkey,
        required_token_mint: Pubkey,
        min_token_balance: u64,
        role_thresholds: Vec<u64>,
    ) -> Result<()> {
        let board = &mut ctx.accounts.reputation_board;
        board.admin = admin;
        board.required_token_mint = required_token_mint;
        board.min_token_balance = min_token_balance;
        board.role_thresholds = role_thresholds;
        board.last_decay_timestamp = Clock::get()?.unix_timestamp;
        board.total_members = 0;
        
        emit!(BoardInitialized {
            admin,
            required_token_mint,
            min_token_balance,
        });
        
        Ok(())
    }

    pub fn vote(
        ctx: Context<Vote>,
        target: Pubkey,
        is_upvote: bool,
    ) -> Result<()> {
        let voter = ctx.accounts.voter.key();
        let current_time = Clock::get()?.unix_timestamp;
        
        // Check token balance requirement
        require!(
            ctx.accounts.voter_token_account.amount >= ctx.accounts.reputation_board.min_token_balance,
            ReputationError::InsufficientTokenBalance
        );

        // Check cooldown using separate PDA
        if ctx.accounts.vote_cooldown.last_vote_timestamp > 0 {
            require!(
                current_time - ctx.accounts.vote_cooldown.last_vote_timestamp >= COOLDOWN_PERIOD,
                ReputationError::CooldownActive
            );
        }

        // Update target reputation
        let target_account = &mut ctx.accounts.target_account;
        if is_upvote {
            target_account.reputation_points = target_account.reputation_points.saturating_add(1);
        } else {
            target_account.reputation_points = target_account.reputation_points.saturating_sub(1);
        }

        // Update cooldown timestamp
        ctx.accounts.vote_cooldown.last_vote_timestamp = current_time;
        ctx.accounts.vote_cooldown.voter = voter;
        ctx.accounts.vote_cooldown.target = target;

        // Check for role unlocks
        check_role_unlock(&ctx.accounts.reputation_board, target_account)?;

        emit!(VoteCast {
            voter,
            target,
            is_upvote,
            new_reputation: target_account.reputation_points,
        });

        Ok(())
    }

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.wallet = ctx.accounts.user.key();
        user_account.reputation_points = 0;
        user_account.roles = Vec::new();
        user_account.last_activity = Clock::get()?.unix_timestamp;

        let voter_account = &mut ctx.accounts.voter_account;
        voter_account.wallet = ctx.accounts.user.key();
        voter_account.total_votes_cast = 0;
        voter_account.last_vote_timestamp = 0;

        ctx.accounts.reputation_board.total_members += 1;

        emit!(UserInitialized {
            wallet: ctx.accounts.user.key(),
        });

        Ok(())
    }

    pub fn admin_reset_all_scores(ctx: Context<AdminResetAllScores>) -> Result<()> {
        require!(
            ctx.accounts.admin.key() == ctx.accounts.reputation_board.admin,
            ReputationError::UnauthorizedAdmin
        );

        emit!(AllScoresReset {
            admin: ctx.accounts.admin.key(),
        });

        Ok(())
    }

    pub fn apply_decay(ctx: Context<ApplyDecay>) -> Result<()> {
        let board = &mut ctx.accounts.reputation_board;
        let current_time = Clock::get()?.unix_timestamp;
        
        require!(
            current_time - board.last_decay_timestamp >= WEEK_IN_SECONDS,
            ReputationError::DecayTooEarly
        );

        board.last_decay_timestamp = current_time;

        emit!(DecayApplied {
            timestamp: current_time,
            decay_rate: DECAY_RATE,
        });

        Ok(())
    }

    pub fn admin_set_role_thresholds(
        ctx: Context<AdminSetRoleThresholds>,
        new_thresholds: Vec<u64>,
    ) -> Result<()> {
        require!(
            ctx.accounts.admin.key() == ctx.accounts.reputation_board.admin,
            ReputationError::UnauthorizedAdmin
        );

        ctx.accounts.reputation_board.role_thresholds = new_thresholds;

        emit!(RoleThresholdsUpdated {
            admin: ctx.accounts.admin.key(),
        });

        Ok(())
    }
}

fn check_role_unlock(board: &ReputationBoard, user_account: &mut UserAccount) -> Result<()> {
    let current_reputation = user_account.reputation_points;
    
    for (role_level, &threshold) in board.role_thresholds.iter().enumerate() {
        if current_reputation >= threshold && !user_account.roles.contains(&(role_level as u8)) {
            user_account.roles.push(role_level as u8);
            
            emit!(RoleUnlocked {
                wallet: user_account.wallet,
                role_level: role_level as u8,
                reputation_points: current_reputation,
            });
        }
    }

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + ReputationBoard::INIT_SPACE,
        seeds = [b"reputation_board"],
        bump
    )]
    pub reputation_board: Account<'info, ReputationBoard>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub reputation_board: Account<'info, ReputationBoard>,
    #[account(
        mut,
        seeds = [b"user_account", target.key().as_ref()],
        bump
    )]
    pub target_account: Account<'info, UserAccount>,
    #[account(
        mut,
        seeds = [b"voter_account", voter.key().as_ref()],
        bump
    )]
    pub voter_account: Account<'info, VoterAccount>,
    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + VoteCooldown::INIT_SPACE,
        seeds = [b"vote_cooldown", voter.key().as_ref(), target.key().as_ref()],
        bump
    )]
    pub vote_cooldown: Account<'info, VoteCooldown>,
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(
        constraint = voter_token_account.mint == reputation_board.required_token_mint,
        constraint = voter_token_account.owner == voter.key()
    )]
    pub voter_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is the target wallet being voted on
    pub target: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub reputation_board: Account<'info, ReputationBoard>,
    #[account(
        init,
        payer = user,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [b"user_account", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    #[account(
        init,
        payer = user,
        space = 8 + VoterAccount::INIT_SPACE,
        seeds = [b"voter_account", user.key().as_ref()],
        bump
    )]
    pub voter_account: Account<'info, VoterAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminResetAllScores<'info> {
    #[account(mut)]
    pub reputation_board: Account<'info, ReputationBoard>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct ApplyDecay<'info> {
    #[account(mut)]
    pub reputation_board: Account<'info, ReputationBoard>,
}

#[derive(Accounts)]
pub struct AdminSetRoleThresholds<'info> {
    #[account(mut)]
    pub reputation_board: Account<'info, ReputationBoard>,
    pub admin: Signer<'info>,
}

#[account]
pub struct ReputationBoard {
    pub admin: Pubkey,
    pub required_token_mint: Pubkey,
    pub min_token_balance: u64,
    pub role_thresholds: Vec<u64>,
    pub last_decay_timestamp: i64,
    pub total_members: u64,
}

impl ReputationBoard {
    const INIT_SPACE: usize = 32 + 32 + 8 + (4 + 8 * 10) + 8 + 8;
}

#[account]
pub struct UserAccount {
    pub wallet: Pubkey,
    pub reputation_points: u64,
    pub roles: Vec<u8>,
    pub last_activity: i64,
}

impl UserAccount {
    const INIT_SPACE: usize = 32 + 8 + (4 + 1 * 10) + 8;
}

#[account]
pub struct VoterAccount {
    pub wallet: Pubkey,
    pub total_votes_cast: u64,
    pub last_vote_timestamp: i64,
}

impl VoterAccount {
    const INIT_SPACE: usize = 32 + 8 + 8;
}

#[account]
pub struct VoteCooldown {
    pub voter: Pubkey,
    pub target: Pubkey,
    pub last_vote_timestamp: i64,
}

impl VoteCooldown {
    const INIT_SPACE: usize = 32 + 32 + 8;
}

#[event]
pub struct BoardInitialized {
    pub admin: Pubkey,
    pub required_token_mint: Pubkey,
    pub min_token_balance: u64,
}

#[event]
pub struct VoteCast {
    pub voter: Pubkey,
    pub target: Pubkey,
    pub is_upvote: bool,
    pub new_reputation: u64,
}

#[event]
pub struct UserInitialized {
    pub wallet: Pubkey,
}

#[event]
pub struct RoleUnlocked {
    pub wallet: Pubkey,
    pub role_level: u8,
    pub reputation_points: u64,
}

#[event]
pub struct AllScoresReset {
    pub admin: Pubkey,
}

#[event]
pub struct DecayApplied {
    pub timestamp: i64,
    pub decay_rate: u16,
}

#[event]
pub struct RoleThresholdsUpdated {
    pub admin: Pubkey,
}

#[error_code]
pub enum ReputationError {
    #[msg("Insufficient token balance to vote")]
    InsufficientTokenBalance,
    #[msg("Cooldown period is still active")]
    CooldownActive,
    #[msg("Unauthorized admin action")]
    UnauthorizedAdmin,
    #[msg("Decay can only be applied once per week")]
    DecayTooEarly,
    #[msg("Invalid role threshold")]
    InvalidRoleThreshold,
}
