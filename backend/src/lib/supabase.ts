import { createClient } from '@supabase/supabase-js';
import { config } from '../config';
import { logger } from '../utils/logger';

if (!config.supabaseUrl || !config.supabaseKey) {
  logger.error('Missing Supabase credentials');
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(config.supabaseUrl, config.supabaseKey);