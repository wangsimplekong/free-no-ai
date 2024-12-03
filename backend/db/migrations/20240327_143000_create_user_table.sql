-- =============================================
-- Author:      Developer
-- Create Date: 2024-03-27
-- Description: Create user table
-- =============================================

CREATE TABLE t_user (
    f_id BIGINT NOT NULL PRIMARY KEY COMMENT '用户ID',
    f_username VARCHAR(50) NOT NULL COMMENT '用户名',
    f_email VARCHAR(100) NOT NULL COMMENT '邮箱',
    f_password VARCHAR(100) NOT NULL COMMENT '密码',
    f_is_active BOOLEAN DEFAULT true COMMENT '是否激活',
    f_create_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    f_update_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    f_operate_time TIMESTAMP WITH TIME ZONE COMMENT '操作时间',
    f_is_deleted BOOLEAN DEFAULT false COMMENT '是否删除',
    UNIQUE(f_username),
    UNIQUE(f_email)
);