import { createClient } from '@supabase/supabase-js';
import { config } from './index';
import { logger } from '../utils/logger';

if (!config.supabaseUrl || !config.supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

// Create Supabase client
export const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('t_phone_verification')
      .select('*')
      .limit(1);
      
    if (error) throw error;
    logger.info('Successfully connected to Supabase');
    return true;
  } catch (error) {
    logger.error('Failed to connect to Supabase:', error);
    throw error;
  }
};

// Initialize database
export const initializeDatabase = async () => {
  try {
    await testConnection();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
};