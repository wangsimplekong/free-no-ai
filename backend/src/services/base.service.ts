import { BaseFields } from '../types/database.types';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class BaseService<T extends BaseFields> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('f_is_deleted', false);

      if (error) throw error;
      return data as T[];
    } catch (error) {
      logger.error(`Error fetching all records from ${this.tableName}:`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('f_id', id)
        .eq('f_is_deleted', false)
        .single();

      if (error) throw error;
      return data as T;
    } catch (error) {
      logger.error(`Error fetching record by id from ${this.tableName}:`, error);
      throw error;
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const { data: newData, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...data,
          f_create_time: new Date().toISOString(),
          f_update_time: new Date().toISOString(),
          f_is_deleted: false
        }])
        .select()
        .single();

      if (error) throw error;
      return newData as T;
    } catch (error) {
      logger.error(`Error creating record in ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const { data: updatedData, error } = await supabase
        .from(this.tableName)
        .update({
          ...data,
          f_update_time: new Date().toISOString()
        })
        .eq('f_id', id)
        .eq('f_is_deleted', false)
        .select()
        .single();

      if (error) throw error;
      return updatedData as T;
    } catch (error) {
      logger.error(`Error updating record in ${this.tableName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          f_is_deleted: true,
          f_update_time: new Date().toISOString()
        })
        .eq('f_id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`Error deleting record in ${this.tableName}:`, error);
      throw error;
    }
  }
}