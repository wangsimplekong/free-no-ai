export const DATABASE = {
  TABLES: {
    USER: 't_user',
  },
  FIELDS: {
    ID: 'f_id',
    CREATE_TIME: 'f_create_time',
    UPDATE_TIME: 'f_update_time',
    OPERATE_TIME: 'f_operate_time',
    IS_DELETED: 'f_is_deleted',
  },
} as const;