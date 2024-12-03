export interface BaseFields {
  f_id: string;
  f_created_at: Date;
  f_updated_at: Date;
  f_created_by?: string;
  f_updated_by?: string;
  f_is_deleted: boolean;
}

export interface User extends BaseFields {
  f_email: string;
  f_password: string;
  f_name?: string;
  f_salt: string;
}

export interface Database {
  public: {
    Tables: {
      t_user: {
        Row: User;
        Insert: Omit<User, keyof BaseFields>;
        Update: Partial<Omit<User, keyof BaseFields>>;
      };
    };
  };
}