declare module 'wechat-oauth' {
  export interface AccessToken {
    data: {
      access_token: string;
      expires_in: number;
      refresh_token: string;
      openid: string;
      scope: string;
    };
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

  export default class OAuth {
    constructor(appid: string, appsecret: string);
    
    getAuthorizeURL(
      redirectUrl: string,
      state: string,
      scope: 'snsapi_base' | 'snsapi_userinfo'
    ): string;
    
    getAccessToken(
      code: string
    ): Promise<AccessToken>;
    
    getUser(
      openid: string,
      accessToken: string
    ): Promise<UserInfo>;
  }
}