-- Create email verification table
CREATE TABLE t_email_verification (
    id              BIGSERIAL       PRIMARY KEY,
    email           VARCHAR(255)    NOT NULL,
    code            VARCHAR(6)      NOT NULL,
    verify_type     SMALLINT,
    verify_count    INTEGER         DEFAULT 0,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id         UUID,
    
    CONSTRAINT uk_email_type_active UNIQUE (email, verify_type, expires_at)
);

-- Create indexes for faster lookups
CREATE INDEX idx_email_verification_email ON t_email_verification(email);
CREATE INDEX idx_email_verification_expires ON t_email_verification(expires_at);
CREATE INDEX idx_email_verification_user ON t_email_verification(user_id);