-- =============================================
-- Database: freenoai
-- Author:   Developer
-- Date:     2024-03-27
-- Version:  1.0
-- Description: Initial database schema setup
-- =============================================

CREATE TABLE t_user (
    id              VARCHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    username        VARCHAR(50)     NOT NULL COMMENT '用户名',
    password        VARCHAR(255)    COMMENT '密码哈希值',
    salt           VARCHAR(32)     COMMENT '密码盐值',
    nickname        VARCHAR(50)     COMMENT '用户昵称',
    avatar_url      VARCHAR(255)    COMMENT '头像URL',
    bio             TEXT            COMMENT '个人简介',
    status          TINYINT         DEFAULT 1 COMMENT '状态：1-正常，2-禁用',
    register_source TINYINT         COMMENT '注册来源：1-手机号，2-微信，3-邮箱，4-谷歌',
    register_ip     VARCHAR(50)     COMMENT '注册IP',
    register_device VARCHAR(255)    COMMENT '注册设备信息',
    last_login_at   TIMESTAMP       COMMENT '最后登录时间',
    last_login_ip   VARCHAR(50)     COMMENT '最后登录IP',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_username (username),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) COMMENT '用户基础信息表';

CREATE TABLE t_user_phone_record (
    id              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    user_id         VARCHAR(36)     NOT NULL COMMENT '用户ID',
    phone           VARCHAR(20)     NOT NULL COMMENT '手机号',
    is_active       BOOLEAN         DEFAULT TRUE COMMENT '是否当前有效绑定',
    bind_time       TIMESTAMP       NOT NULL COMMENT '绑定时间',
    unbind_time     TIMESTAMP       COMMENT '解绑时间',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    UNIQUE KEY uk_phone (phone),
    UNIQUE KEY uk_user_active (user_id, is_active),
    INDEX idx_bind_time (bind_time)
) COMMENT '用户手机号绑定表';

CREATE TABLE t_user_wechat_record (
    id              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    user_id         VARCHAR(36)     NOT NULL COMMENT '用户ID',
    openid          VARCHAR(50)     NOT NULL COMMENT '微信openid',
    unionid         VARCHAR(50)     COMMENT '微信unionid',
    nickname        VARCHAR(50)     COMMENT '微信昵称',
    avatar_url      VARCHAR(255)    COMMENT '微信头像',
    is_active       BOOLEAN         DEFAULT TRUE COMMENT '是否当前有效绑定',
    bind_time       TIMESTAMP       NOT NULL COMMENT '绑定时间',
    unbind_time     TIMESTAMP       COMMENT '解绑时间',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    UNIQUE KEY uk_openid (openid),
    UNIQUE KEY uk_unionid_active (unionid, is_active),
    UNIQUE KEY uk_user_active (user_id, is_active),
    INDEX idx_bind_time (bind_time)
) COMMENT '用户微信绑定表';

CREATE TABLE t_user_google_record (
    id              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    user_id         VARCHAR(36)     NOT NULL COMMENT '用户ID',
    google_id       VARCHAR(50)     NOT NULL COMMENT '谷歌账号ID',
    email           VARCHAR(100)    NOT NULL COMMENT '谷歌邮箱',
    name            VARCHAR(50)     COMMENT '谷歌账号名称',
    avatar_url      VARCHAR(255)    COMMENT '谷歌头像',
    is_active       BOOLEAN         DEFAULT TRUE COMMENT '是否当前有效绑定',
    bind_time       TIMESTAMP       NOT NULL COMMENT '绑定时间',
    unbind_time     TIMESTAMP       COMMENT '解绑时间',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    UNIQUE KEY uk_google_id (google_id),
    UNIQUE KEY uk_user_active (user_id, is_active),
    INDEX idx_bind_time (bind_time)
) COMMENT '用户谷歌账号绑定表';

CREATE TABLE t_user_email_record (
    id              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    user_id         VARCHAR(36)     NOT NULL COMMENT '用户ID',
    email           VARCHAR(100)    NOT NULL COMMENT '邮箱地址',
    is_verified     BOOLEAN         DEFAULT FALSE COMMENT '是否已验证',
    is_active       BOOLEAN         DEFAULT TRUE COMMENT '是否当前有效绑定',
    bind_time       TIMESTAMP       NOT NULL COMMENT '绑定时间',
    verify_time     TIMESTAMP       COMMENT '验证时间',
    unbind_time     TIMESTAMP       COMMENT '解绑时间',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_user_active (user_id, is_active),
    INDEX idx_bind_time (bind_time)
) COMMENT '用户邮箱绑定表';

CREATE TABLE t_user_token (
    id              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    user_id         VARCHAR(36)     NOT NULL COMMENT '用户ID',
    access_token    VARCHAR(500)    NOT NULL COMMENT '访问令牌',
    token_type      TINYINT         DEFAULT 1 COMMENT '令牌类型：1-登录令牌，2-其他',
    client_id       VARCHAR(50)     COMMENT '客户端标识',
    device_info     VARCHAR(255)    COMMENT '设备信息',
    expires_at      TIMESTAMP       NOT NULL COMMENT '过期时间',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    INDEX idx_user (user_id),
    INDEX idx_access_token (access_token),
    INDEX idx_expires_at (expires_at)
) COMMENT '用户令牌表';

CREATE TABLE t_user_login_log (
    id              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    user_id         VARCHAR(36)     NOT NULL COMMENT '用户ID',
    login_type      TINYINT         COMMENT '登录方式：1-手机号，2-微信，3-邮箱，4-谷歌',
    login_ip        VARCHAR(50)     COMMENT '登录IP',
    login_device    VARCHAR(255)    COMMENT '登录设备信息',
    login_status    TINYINT         COMMENT '登录状态：1-成功，2-失败',
    fail_reason     VARCHAR(255)    COMMENT '失败原因',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    INDEX idx_user_time (user_id, created_at),
    INDEX idx_ip_time (login_ip, created_at),
    INDEX idx_login_status (login_status)
) COMMENT '用户登录日志表';

CREATE TABLE t_user_operation_log (
    id              BIGINT          PRIMARY KEY AUTO_INCREMENT,
    user_id         VARCHAR(36)     NOT NULL COMMENT '用户ID',
    operation_type  VARCHAR(50)     NOT NULL COMMENT '操作类型',
    operation_id    VARCHAR(50)     NOT NULL COMMENT '操作对象ID',
    operation_desc  VARCHAR(255)    COMMENT '操作描述',
    operation_data  JSON            COMMENT '操作相关数据',
    client_ip       VARCHAR(50)     COMMENT '客户端IP',
    client_device   VARCHAR(255)    COMMENT '客户端设备信息',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    INDEX operation_id(operation_id),
    INDEX idx_user_type_time (user_id, operation_type, created_at),
    INDEX idx_created_at (created_at)
) COMMENT '用户操作日志表';



CREATE TABLE t_order (
    id              VARCHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    order_no        VARCHAR(32)     NOT NULL COMMENT '订单编号',
    user_id         VARCHAR(36)     NOT NULL COMMENT '用户ID',
    plan_id         VARCHAR(36)     NOT NULL COMMENT '套餐ID',
    amount          DECIMAL(10,2)   NOT NULL COMMENT '订单金额',
    status          TINYINT         DEFAULT 1 COMMENT '状态：1-待支付，2-已支付，3-已取消，4-已退款',
    pay_type        TINYINT         COMMENT '支付方式：1-微信，2-支付宝',
    expire_time     TIMESTAMP       NOT NULL COMMENT '订单过期时间',
    pay_time        TIMESTAMP       COMMENT '支付时间',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    FOREIGN KEY (plan_id) REFERENCES t_member_plan(id),
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_user_status (user_id, status),
    INDEX idx_created_at (created_at)
) COMMENT '订单表';

CREATE TABLE t_member_plan (
    id              VARCHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    name            VARCHAR(50)     NOT NULL COMMENT '套餐名称',
    level           TINYINT         NOT NULL COMMENT '套餐等级：1-基础版，2-标准版，3-高级版',
    period_type     TINYINT         NOT NULL COMMENT '时间类型：1-月度，2-年度',
    price           DECIMAL(10,2)   NOT NULL COMMENT '套餐价格',
    detection_quota INT             NOT NULL COMMENT '检测字符数',
    rewrite_quota   INT             NOT NULL COMMENT '降重字符数',
    status          TINYINT         DEFAULT 1 COMMENT '状态：1-正常，2-下架',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_level_period (level, period_type),
    INDEX idx_status (status)
) COMMENT '会员套餐表';

CREATE TABLE t_user_quota (
    id              VARCHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    user_id         VARCHAR(36)     NOT NULL COMMENT '用户ID',
    quota_type      TINYINT         NOT NULL COMMENT '额度类型：1-检测，2-降重',
    total_quota     INT             NOT NULL DEFAULT 0 COMMENT '总额度',
    used_quota      INT             NOT NULL DEFAULT 0 COMMENT '已用额度',
    expire_time     TIMESTAMP       COMMENT '过期时间',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    UNIQUE KEY uk_user_type (user_id, quota_type),
    INDEX idx_expire_time (expire_time)
) COMMENT '用户额度表';

CREATE TABLE t_member (
    id              VARCHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    user_id         VARCHAR(36)     NOT NULL COMMENT '用户ID',
    plan_id         VARCHAR(36)     NOT NULL COMMENT '套餐ID',
    status          TINYINT         DEFAULT 1 COMMENT '状态：1-正常，2-已过期，3-已取消',
    start_time      TIMESTAMP       NOT NULL COMMENT '开始时间',
    expire_time     TIMESTAMP       NOT NULL COMMENT '到期时间',
    auto_renew      BOOLEAN         DEFAULT FALSE COMMENT '是否自动续费',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES t_user(id),
    FOREIGN KEY (plan_id) REFERENCES t_member_plan(id),
    INDEX idx_user_status (user_id, status),
    INDEX idx_expire_time (expire_time)
) COMMENT '会员信息表';