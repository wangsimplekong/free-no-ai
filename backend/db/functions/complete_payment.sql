CREATE OR REPLACE FUNCTION complete_payment(
  p_order_id UUID,
  p_user_id UUID,
  p_plan_id UUID,
  p_start_time TIMESTAMP,
  p_expire_time TIMESTAMP,
  p_detection_quota INTEGER,
  p_rewrite_quota INTEGER
) RETURNS void AS $$
BEGIN
  -- Update order status to paid
  UPDATE t_order 
  SET status = 2, 
      updated_at = CURRENT_TIMESTAMP 
  WHERE id = p_order_id;

  -- Insert or update member record
  INSERT INTO t_member (
    user_id,
    plan_id,
    status,
    start_time,
    expire_time,
    auto_renew
  ) VALUES (
    p_user_id,
    p_plan_id,
    1,
    p_start_time,
    p_expire_time,
    false
  )
  ON CONFLICT (user_id) DO UPDATE
  SET plan_id = EXCLUDED.plan_id,
      status = 1,
      start_time = EXCLUDED.start_time,
      expire_time = EXCLUDED.expire_time,
      updated_at = CURRENT_TIMESTAMP;

  -- Update detection quota
  INSERT INTO t_user_quota (
    user_id,
    quota_type,
    total_quota,
    used_quota,
    expire_time
  ) VALUES (
    p_user_id,
    1,
    p_detection_quota,
    0,
    p_expire_time
  )
  ON CONFLICT (user_id, quota_type) DO UPDATE
  SET total_quota = t_user_quota.total_quota + EXCLUDED.total_quota,
      expire_time = GREATEST(t_user_quota.expire_time, EXCLUDED.expire_time),
      updated_at = CURRENT_TIMESTAMP;

  -- Update rewrite quota
  INSERT INTO t_user_quota (
    user_id,
    quota_type,
    total_quota,
    used_quota,
    expire_time
  ) VALUES (
    p_user_id,
    2,
    p_rewrite_quota,
    0,
    p_expire_time
  )
  ON CONFLICT (user_id, quota_type) DO UPDATE
  SET total_quota = t_user_quota.total_quota + EXCLUDED.total_quota,
      expire_time = GREATEST(t_user_quota.expire_time, EXCLUDED.expire_time),
      updated_at = CURRENT_TIMESTAMP;

END;
$$ LANGUAGE plpgsql;