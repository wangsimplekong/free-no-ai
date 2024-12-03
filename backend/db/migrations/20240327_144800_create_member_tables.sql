-- Create member plan table
CREATE TABLE IF NOT EXISTS t_member_plan (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(50)     NOT NULL,
    level           SMALLINT        NOT NULL,
    period_type     SMALLINT        NOT NULL,
    price           DECIMAL(10,2)   NOT NULL,
    detection_quota INTEGER         NOT NULL,
    rewrite_quota   INTEGER         NOT NULL,
    status          SMALLINT        DEFAULT 1,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create member table
CREATE TABLE IF NOT EXISTS t_member (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES t_user(id),
    plan_id         UUID            NOT NULL REFERENCES t_member_plan(id),
    status          SMALLINT        DEFAULT 1,
    start_time      TIMESTAMP WITH TIME ZONE NOT NULL,
    expire_time     TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew      BOOLEAN         DEFAULT false,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user quota table
CREATE TABLE IF NOT EXISTS t_user_quota (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES t_user(id),
    quota_type      SMALLINT        NOT NULL,
    total_quota     INTEGER         NOT NULL DEFAULT 0,
    used_quota      INTEGER         NOT NULL DEFAULT 0,
    expire_time     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quota_type)
);

-- Create quota record table
CREATE TABLE IF NOT EXISTS t_quota_record (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES t_user(id),
    quota_type      SMALLINT        NOT NULL,
    change_type     SMALLINT        NOT NULL,
    change_amount   INTEGER         NOT NULL,
    before_amount   INTEGER         NOT NULL,
    after_amount    INTEGER         NOT NULL,
    order_id        UUID,
    remark          VARCHAR(255),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_member_user ON t_member(user_id);
CREATE INDEX idx_member_status ON t_member(status);
CREATE INDEX idx_member_expire ON t_member(expire_time);
CREATE INDEX idx_quota_user ON t_user_quota(user_id);
CREATE INDEX idx_quota_expire ON t_user_quota(expire_time);
CREATE INDEX idx_quota_record_user ON t_quota_record(user_id);
CREATE INDEX idx_quota_record_order ON t_quota_record(order_id);