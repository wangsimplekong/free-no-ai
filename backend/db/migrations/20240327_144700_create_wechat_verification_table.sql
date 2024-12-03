-- Create WeChat verification table
CREATE TABLE t_wechat_verification (
    id              BIGSERIAL       PRIMARY KEY,
    state           VARCHAR(36)     NOT NULL,
    openid          VARCHAR(64),
    verify_type     SMALLINT,
    verify_count    INTEGER         DEFAULT 0,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id         UUID,
    
    CONSTRAINT uk_wechat_state UNIQUE (state)
);

-- Create indexes for faster lookups
CREATE INDEX idx_wechat_verification_openid ON t_wechat_verification(openid);
CREATE INDEX idx_wechat_verification_expires ON t_wechat_verification(expires_at);
CREATE INDEX idx_wechat_verification_user ON t_wechat_verification(user_id);