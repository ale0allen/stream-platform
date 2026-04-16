-- Add OAuth/manual distinction and ensure a Twitch account cannot be linked to multiple users.

ALTER TABLE stream_accounts
    ADD COLUMN connection_type VARCHAR(20) NOT NULL DEFAULT 'MANUAL';

-- Prevent linking the same platform account to multiple users.
CREATE UNIQUE INDEX IF NOT EXISTS ux_stream_accounts_platform_platform_user_id
    ON stream_accounts(platform, platform_user_id);

-- Ensure one account per platform per user (simplifies UX and OAuth management).
CREATE UNIQUE INDEX IF NOT EXISTS ux_stream_accounts_user_platform
    ON stream_accounts(user_id, platform);

