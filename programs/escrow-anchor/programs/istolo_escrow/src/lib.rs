use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWxTWqkZxYwGz3Y9VdQzN9wW8m3");

#[program]
pub mod istolo_escrow {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.escrow_config;
        config.authority = ctx.accounts.authority.key();
        config.bump = ctx.bumps.escrow_config;
        config.created_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + EscrowConfig::INIT_SPACE,
        seeds = [b"escrow_config", authority.key().as_ref()],
        bump
    )]
    pub escrow_config: Account<'info, EscrowConfig>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct EscrowConfig {
    pub authority: Pubkey,
    pub bump: u8,
    pub created_at: i64,
}
