import { supabase } from '../../config/database';
import { logger } from '../../utils/logger';
import { OrderStatus, PayType } from '../../types/order.types';

interface CreateOrderParams {
  id: string;
  order_no: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: OrderStatus;
  pay_type: PayType;
  expire_time: Date;
  created_at: string;
  updated_at: string;
}

interface OrderQueryParams {
  page: number;
  pageSize: number;
  userId?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

export class OrderRepository {
  private readonly TABLE_NAME = 't_order';

  async create(params: CreateOrderParams) {
    try {
      logger.info('Creating order with params:', {
        ...params,
        expire_time: params.expire_time.toISOString()
      });

      const insertData = {
        id: params.id,
        order_no: params.order_no,
        user_id: params.user_id,
        plan_id: params.plan_id,
        amount: params.amount,
        status: params.status,
        pay_type: params.pay_type,
        expire_time: params.expire_time.toISOString(),
        created_at: params.created_at,
        updated_at: params.updated_at
      };

      logger.info('Inserting order with data:', insertData);
      logger.info('Table name:', this.TABLE_NAME);

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        logger.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to create order: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned after creating order');
      }

      logger.info('Order created successfully:', {
        orderId: data.id,
        orderNo: data.order_no
      });

      return data;
    } catch (error) {
      logger.error('Failed to create order:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error,
        params: {
          ...params,
          expire_time: params.expire_time.toISOString()
        }
      });
      throw error;
    }
  }

  async findById(id: string) {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Error finding order by ID:', {
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          },
          id
        });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find order:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error,
        id
      });
      throw error;
    }
  }

  async findOrders(params: OrderQueryParams) {
    try {
      const { page = 1, pageSize = 10, userId, status, startDate, endDate } = params;
      const offset = (page - 1) * pageSize;

      // Build query
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*, t_member_plan!inner(*)', { count: 'exact' });

      // Apply filters
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (status !== undefined) {
        query = query.eq('status', status);
      }
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      // Apply pagination
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Error finding orders:', {
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          },
          params
        });
        throw error;
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize
      };
    } catch (error) {
      logger.error('Failed to find orders:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error,
        params
      });
      throw error;
    }
  }

  async updateStatus(id: string, status: OrderStatus) {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        logger.error('Error updating order status:', {
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          },
          id,
          status
        });
        throw error;
      }
    } catch (error) {
      logger.error('Failed to update order status:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error,
        id,
        status
      });
      throw error;
    }
  }
}