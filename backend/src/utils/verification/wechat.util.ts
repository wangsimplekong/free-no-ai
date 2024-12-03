import axios from 'axios';
import { logger } from '../logger';

export interface WeChatConfig {
  appId: string;
  appSecret: string;
  redirectUrl: string;
  scope: 'snsapi_base' | 'snsapi_userinfo';
  state?: string;
}

export interface AccessToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
}

export interface UserInfo {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
}

export const DEFAULT_WECHAT_CONFIG: WeChatConfig = {
  appId: process.env.WECHAT_APP_ID || '',
  appSecret: process.env.WECHAT_APP_SECRET || '',
  redirectUrl: process.env.WECHAT_REDIRECT_URL || '',
  scope: 'snsapi_userinfo'
};

export class WeChatOAuthUtil {
  private config: WeChatConfig;
  private baseUrl = 'https://api.weixin.qq.com/sns';

  constructor(config: Partial<WeChatConfig> = {}) {
    this.config = { ...DEFAULT_WECHAT_CONFIG, ...config };
  }

  /**
   * Generate OAuth URL for WeChat login
   */
  getAuthUrl(): string {
    try {
      const params = new URLSearchParams({
        appid: this.config.appId,
        redirect_uri: this.config.redirectUrl,
        response_type: 'code',
        scope: this.config.scope,
        state: this.config.state || ''
      });

      const url = `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`;

      logger.info('Generated WeChat OAuth URL', {
        redirectUrl: this.config.redirectUrl,
        scope: this.config.scope
      });

      return url;
    } catch (error) {
      logger.error('Failed to generate WeChat OAuth URL', { error });
      throw new Error('Failed to generate WeChat OAuth URL');
    }
  }

  /**
   * Get OAuth access token using authorization code
   */
  async getAccessToken(code: string): Promise<AccessToken> {
    try {
      const response = await axios.get(`${this.baseUrl}/oauth2/access_token`, {
        params: {
          appid: this.config.appId,
          secret: this.config.appSecret,
          code,
          grant_type: 'authorization_code'
        }
      });

      if (response.data.errcode) {
        throw new Error(`WeChat API error: ${response.data.errmsg}`);
      }

      logger.info('Retrieved WeChat access token', {
        openid: response.data.openid
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get WeChat access token', {
        error,
        code
      });
      throw new Error('Failed to get WeChat access token');
    }
  }

  /**
   * Get user information using access token
   */
  async getUserInfo(openid: string, accessToken: string): Promise<UserInfo> {
    try {
      const response = await axios.get(`${this.baseUrl}/userinfo`, {
        params: {
          access_token: accessToken,
          openid,
          lang: 'zh_CN'
        }
      });

      if (response.data.errcode) {
        throw new Error(`WeChat API error: ${response.data.errmsg}`);
      }

      logger.info('Retrieved WeChat user info', {
        openid,
        nickname: response.data.nickname
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get WeChat user info', {
        error,
        openid
      });
      throw new Error('Failed to get WeChat user info');
    }
  }

  /**
   * Validate OAuth state to prevent CSRF
   */
  validateState(state: string, savedState: string): boolean {
    return state === savedState;
  }
}

export default new WeChatOAuthUtil();