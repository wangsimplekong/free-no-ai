import { supabase } from '../../config/database';
import { logger } from '../../utils/logger';
import { UpdateProfileDTO } from '../../dto/user/user.dto';
import { hashPassword } from '../../utils/crypto.util';
import crypto from 'crypto';

export class UserService {
  private readonly TABLE_NAME = 't_user';

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<any> {
    try {
      logger.info('Updating user profile', {
        userId,
        updateFields: Object.keys(data)
      });

      const updateData: Record<string, any> = {};
      
      // Only include fields that are provided
      if (data.nickname !== undefined) {
        updateData.nickname = data.nickname;
      }
      if (data.avatarUrl !== undefined) {
        updateData.avatar_url = data.avatarUrl;
      }

      // Only update if there are fields to update
      if (Object.keys(updateData).length > 0) {
        updateData.updated_at = new Date().toISOString();

        const { data: updatedUser, error } = await supabase
          .from(this.TABLE_NAME)
          .update(updateData)
          .eq('id', userId)
          .eq('status', 1)
          .select('id, username, nickname, avatar_url, created_at')
          .single();

        if (error) {
          logger.error('Database error in updateProfile:', {
            error,
            userId,
            updateData
          });
          throw error;
        }

        logger.info('Profile updated successfully', {
          userId,
          updatedFields: Object.keys(updateData)
        });

        return updatedUser;
      } else {
        logger.error('Failed to update user profile: data is empty');
        throw new Error('update data is empty');
      }
    } catch (error) {
      logger.error('Failed to update user profile:', {
        error,
        userId,
        data
      });
      throw error;
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      // Generate new salt and hash for new password
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = hashPassword(newPassword, salt);

      // Update password
      const { error: updateError } = await supabase
        .from(this.TABLE_NAME)
        .update({
          password: hashedPassword,
          salt,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .eq('status', 1);

      if (updateError) {
        logger.error('Failed to update password in database:', {
          error: updateError,
          userId
        });
        throw updateError;
      }

      logger.info('Password updated successfully', {
        userId
      });
    } catch (error) {
      logger.error('Failed to update password:', {
        error,
        userId
      });
      throw error;
    }
  }
}