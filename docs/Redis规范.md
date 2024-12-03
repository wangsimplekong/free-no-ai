# Redis规范

## Redis使用

## 基础技术栈

```plaintext
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: 'https://mighty-midge-42627.upstash.io',
  token: 'AaaDAAIjcDE0YWQxYzlhOGM0N2M0ZjExOGRhOTQzODBkODVhYjhhMXAxMA',
})

await redis.set('foo', 'bar');
const data = await redis.get('foo');
```

### 在config目录下配置redis基本信息，注意将连接参数等抽离到.env环境变量中

```plaintext
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const redisConfig = {
  development: {
    url: process.env.REDIS_URL || 'https://mighty-midge-42627.upstash.io',
    token: process.env.REDIS_TOKEN || 'AaaDAAIjcDE0YWQxYzlhOGM0N2M0ZjExOGRhOTQzODBkODVhYjhhMXAxMA'
  },
  production: {
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN
  },
  test: {
    url: process.env.TEST_REDIS_URL || process.env.REDIS_URL,
    token: process.env.TEST_REDIS_TOKEN || process.env.REDIS_TOKEN
  }
};

// Validate and get configuration for current environment
const getConfig = () => {
  const config = redisConfig[env];
  if (!config.url || !config.token) {
    throw new Error(`Missing required Redis configuration for environment: ${env}`);
  }
  return config;
};

module.exports = getConfig();
```

### 在utils/目录下创建redis基础方法封装

```plaintext
// utils/constant/TimeUnits
const TimeUnits = {
  SECONDS: 'EX',
  MILLISECONDS: 'PX',
  MINUTES: 'MINUTES',
  HOURS: 'HOURS',
  DAYS: 'DAYS'
};

const convertToSeconds = (value, unit) => {
  switch (unit) {
    case TimeUnits.SECONDS:
      return value;
    case TimeUnits.MILLISECONDS:
      return Math.floor(value / 1000);
    case TimeUnits.MINUTES:
      return value * 60;
    case TimeUnits.HOURS:
      return value * 60 * 60;
    case TimeUnits.DAYS:
      return value * 24 * 60 * 60;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
};

module.exports = {
  TimeUnits,
  convertToSeconds
};
```
```plaintext
const { Redis } = require('@upstash/redis');
const { TimeUnits, convertToSeconds } = require('./constants/TimeUnits');

class RedisService {
  constructor(config, logger) {
    this.logger = logger;
    this.client = new Redis({
      url: config.url,
      token: config.token,
    });
  }

  async initialize() {
    try {
      this.logger.info('Initializing Redis connection', {
        context: 'RedisService',
        timestamp: new Date().toISOString()
      });

      await this.client.ping();

      this.logger.info('Redis connection established successfully', {
        context: 'RedisService',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logger.error('Redis connection failed', {
        context: 'RedisService',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async set(key, value, expire = null) {
    return this.setEx(key, value, expire, TimeUnits.SECONDS);
  }

  async setEx(key, value, expire = null, unit = TimeUnits.SECONDS) {
    try {
      this.logger.debug('Setting Redis key with expiration', {
        context: 'RedisService',
        key,
        expire,
        unit,
        timestamp: new Date().toISOString()
      });

      let result;
      if (expire !== null) {
        const seconds = convertToSeconds(expire, unit);
        result = await this.client.set(key, value, { ex: seconds });
      } else {
        result = await this.client.set(key, value);
      }

      this.logger.debug('Redis key set successfully', {
        context: 'RedisService',
        key,
        expire,
        unit,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to set Redis key', {
        context: 'RedisService',
        key,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async get(key) {
    try {
      this.logger.debug('Getting Redis key', {
        context: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      });

      const result = await this.client.get(key);

      this.logger.debug('Redis key retrieved successfully', {
        context: 'RedisService',
        key,
        found: result !== null,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get Redis key', {
        context: 'RedisService',
        key,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async del(key) {
    try {
      this.logger.debug('Deleting Redis key', {
        context: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      });

      const result = await this.client.del(key);

      this.logger.debug('Redis key deleted successfully', {
        context: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to delete Redis key', {
        context: 'RedisService',
        key,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async exists(key) {
    try {
      this.logger.debug('Checking Redis key existence', {
        context: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      });

      const result = await this.client.exists(key);

      this.logger.debug('Redis key existence checked', {
        context: 'RedisService',
        key,
        exists: result === 1,
        timestamp: new Date().toISOString()
      });

      return result === 1;
    } catch (error) {
      this.logger.error('Failed to check Redis key existence', {
        context: 'RedisService',
        key,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async ttl(key) {
    try {
      this.logger.debug('Getting Redis key TTL', {
        context: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      });

      const result = await this.client.ttl(key);

      this.logger.debug('Redis key TTL retrieved', {
        context: 'RedisService',
        key,
        ttl: result,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get Redis key TTL', {
        context: 'RedisService',
        key,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}

module.exports = RedisService;
```
```plaintext
const RedisService = require('./RedisService');
const redisConfig = require('../../config/redis.config');
const LoggerFactory = require('../../utils/logger/LoggerFactory');
const loggerConfig = require('../../config/logger.config');

class RedisManager {
  static instance = null;
  static logger = LoggerFactory.createLogger('both', loggerConfig);

  static async getInstance() {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisService(redisConfig, RedisManager.logger);
      await RedisManager.instance.initialize();
    }
    return RedisManager.instance;
  }
}

module.exports = RedisManager;
```

### 环境变量配置

```plaintext
# Redis Configuration
REDIS_URL=https://mighty-midge-42627.upstash.io
REDIS_TOKEN=AaaDAAIjcDE0YWQxYzlhOGM0N2M0ZjExOGRhOTQzODBkODVhYjhhMXAxMA

```

### 业务使用

```plaintext
const RedisManager = require('../redis/RedisManager');

async function someBusinessLogic() {
  const redis = await RedisManager.getInstance();
  await redis.set('key', 'value');
}

```

# 业务规范

## 1. Key 命名规范

### 1.1 基本格式

```plaintext
project:module:key
```

*   project: 项目名称
    
*   module: 业务模块名
    
*   key: 具体的业务标识
    

### 1.2 命名示例

```plaintext
// 用户模块
user:profile:1001        // 用户资料
user:following:1001      // 用户关注列表
user:followers:1001      // 用户粉丝列表

// 商品模块
product:detail:10086     // 商品详情
product:stock:10086      // 商品库存
product:category:1       // 商品分类

// 订单模块
order:info:NO123456      // 订单信息
order:status:NO123456    // 订单状态
```

## 2. 过期时间设置规范

### 2.1 基本原则

*   所有 key 必须设置过期时间(TTL)
    
*   仅当确认会通过 DEL 命令或定时任务清理的 key 可以不设置过期时间
    
*   过期时间应该根据业务场景合理设置
    

### 2.2 建议过期时间

```plaintext
// 短期缓存
验证码: 5分钟
用户token: 2小时
会话信息: 24小时

// 中期缓存
用户信息: 7天
商品信息: 12小时
分类信息: 24小时

// 长期缓存
配置信息: 30天
静态资料: 7天
```

## 3. 数据结构使用规范

### 3.1 String

适用场景：

*   单个对象的序列化存储
    
*   计数器
    
*   Token存储
    

```typescript
// 存储用户信息
await redis.set('user:profile:1001', JSON.stringify(userProfile), { ex: 7 * 24 * 3600 })

// 计数器
await redis.incr('stats:daily:visits')
```

### 3.2 Hash

适用场景：

*   对象字段的部分更新
    
*   多个字段的关联数据
    

```typescript
// 存储商品信息
await redis.hset('product:detail:10086', {
  name: '商品名称',
  price: 99.99,
  stock: 100
})
await redis.expire('product:detail:10086', 12 * 3600)
```

### 3.3 List

适用场景：

*   消息队列
    
*   最新N条记录
    

```typescript
// 存储用户最近10条消息
await redis.lpush('user:messages:1001', JSON.stringify(message))
await redis.ltrim('user:messages:1001', 0, 9)
await redis.expire('user:messages:1001', 7 * 24 * 3600)
```

### 3.4 Set

适用场景：

*   无序且唯一的集合
    
*   标签
    
*   好友/关注关系
    

```typescript
// 存储用户标签
await redis.sadd('user:tags:1001', 'vip', 'new')
await redis.expire('user:tags:1001', 30 * 24 * 3600)
```

### 3.5 Sorted Set

适用场景：

*   排行榜
    
*   权重排序
    
*   时间线
    

```typescript
// 积分排行榜
await redis.zadd('rank:score', { 'user:1001': 100, 'user:1002': 200 })
await redis.expire('rank:score', 24 * 3600)
```

## 4. 性能优化建议

### 4.1 批量操作

*   使用 pipeline 或 multi 进行批量操作
    
*   减少网络往返次数
    

```typescript
// 批量获取用户信息
const pipeline = redis.pipeline()
userIds.forEach(id => {
  pipeline.get(`user:profile:${id}`)
})
const results = await pipeline.exec()
```

### 4.2 大key处理

*   避免存储大对象
    
*   建议单个 key 的 value 大小不超过 10KB
    
*   大对象考虑拆分或使用其他存储方案