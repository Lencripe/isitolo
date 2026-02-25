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

    pub fn create_collection(
        ctx: Context<CreateCollection>,
        collection_id: String,
        category: u8,
        metadata_json: String,
    ) -> Result<()> {
        require!(category <= 1, EscrowError::InvalidCollectionCategory);
        require!(
            !collection_id.trim().is_empty() && collection_id.len() <= CreatorCollectionAccount::MAX_COLLECTION_ID_LEN,
            EscrowError::InvalidCollectionId
        );
        require!(
            !metadata_json.trim().is_empty() && metadata_json.len() <= CreatorCollectionAccount::MAX_METADATA_LEN,
            EscrowError::InvalidCollectionMetadata
        );

        let now = Clock::get()?.unix_timestamp;
        let collection = &mut ctx.accounts.creator_collection;
        collection.authority = ctx.accounts.authority.key();
        collection.bump = ctx.bumps.creator_collection;
        collection.category = category;
        collection.collection_id = collection_id;
        collection.metadata_json = metadata_json;
        collection.created_at = now;
        collection.updated_at = now;

        Ok(())
    }

    pub fn delete_collection(ctx: Context<DeleteCollection>, _collection_id: String) -> Result<()> {
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

#[derive(Accounts)]
#[instruction(collection_id: String, _category: u8, _metadata_json: String)]
pub struct CreateCollection<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + CreatorCollectionAccount::INIT_SPACE,
        seeds = [b"collection", authority.key().as_ref(), collection_id.as_bytes()],
        bump
    )]
    pub creator_collection: Account<'info, CreatorCollectionAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(collection_id: String)]
pub struct DeleteCollection<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"collection", authority.key().as_ref(), collection_id.as_bytes()],
        bump = creator_collection.bump,
        has_one = authority,
        close = authority
    )]
    pub creator_collection: Account<'info, CreatorCollectionAccount>,
}

#[account]
#[derive(InitSpace)]
pub struct EscrowConfig {
    pub authority: Pubkey,
    pub bump: u8,
    pub created_at: i64,
}

#[account]
#[derive(InitSpace)]
pub struct CreatorCollectionAccount {
    pub authority: Pubkey,
    pub bump: u8,
    pub category: u8,
    pub created_at: i64,
    pub updated_at: i64,
    #[max_len(96)]
    pub collection_id: String,
    #[max_len(4096)]
    pub metadata_json: String,
}

impl CreatorCollectionAccount {
    pub const MAX_COLLECTION_ID_LEN: usize = 96;
    pub const MAX_METADATA_LEN: usize = 4096;
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid collection category")]
    InvalidCollectionCategory,
    #[msg("Invalid collection id")]
    InvalidCollectionId,
    #[msg("Invalid collection metadata")]
    InvalidCollectionMetadata,
}
