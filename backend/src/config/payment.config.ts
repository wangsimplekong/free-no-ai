import dotenv from 'dotenv';

dotenv.config();

export const paymentConfig = {
  gateway: {
    url: process.env.PAY_GATEWAY_URL || 'https://tunionpay.paperyy.com/pay/view/qrcode',
    appId: process.env.PAY_APP_ID || '1072',
    appSecret: process.env.PAY_APP_SECRET || 'zprZ7A66rskxZZEA7Wr6dN4Wsj6M4GNC',
    notifyUrl: `${process.env.API_BASE_URL}/api/payments/notify`
  },
  
  order: {
    expireTime: 1800,  // 30 minutes
    retryTimes: 3,
    retryDelay: 1000
  },
  
  cache: {
    orderPrefix: 'order:',
    paymentPrefix: 'payment:',
    expireTime: 1800
  }
};