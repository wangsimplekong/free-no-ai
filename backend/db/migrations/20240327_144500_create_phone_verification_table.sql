-- Create phone verification table
CREATE TABLE t_phone_verification (
    id              BIGSERIAL       PRIMARY KEY,
    phone           VARCHAR(20)     NOT NULL,
    code            VARCHAR(6)      NOT NULL,
    verify_type     SMALLINT,
    verify_count    INTEGER         DEFAULT 0,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_phone_type_active UNIQUE (phone, verify_type, expires_at)
);

-- Create index for faster lookups
CREATE INDEX idx_phone_verification_phone ON t_phone_verification(phone);
CREATE INDEX idx_phone_verification_expires ON t_phone_verification(expires_at);