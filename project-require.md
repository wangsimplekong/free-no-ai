## 1. 项目基础架构

### 1.1 项目依赖管理

#### 1.1.1 依赖管理原则

- 前后端项目完全分离，各自维护独立的 package.json
- 禁止在根目录使用 monorepo 管理依赖
- 前后端依赖版本必须锁定，使用 package-lock.json
- 定期进行依赖更新和安全检查

#### 1.1.2 技术栈选型

- 前端：Vite + React + TypeScript
- 后端：Express + TypeScript
- 数据库：supabase(开发阶段使用)、PostgreSQL(生产部署)
- 缓存：Redis (按需引入)
- ORM：Sequelize
- 包管理器：npm (统一使用 npm 以确保依赖安装的一致性)
- 除一些通常用的 Dialog、Confirm 等，否则不要使用 UI 库

### 1.2 项目结构

```
project-root/               # 项目根目录
├── .gitignore              # Git忽略文件
├── README.md               # 项目说明文档
├── docs                    # 项目开发过程中的需求和变更文档
│   ├── database.sql        # 数据库的变更语句
├── frontend/               # 前端项目目录（独立的npm项目）
│   ├── package.json        # 前端依赖配置
│   ├── src/
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 公共组件
│   │   │   ├── base/       # 基础组件(基于 Ant Design 的二次封装)
│   │   │   ├── business/   # 业务组件
│   │   │   └── common/     # 通用组件
│   │   ├── hooks/         # 自定义hooks
│   │   ├── layouts/       # 布局组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   ├── store/         # 状态管理
│   │   ├── styles/        # 全局样式
│   │   ├── types/         # TypeScript 类型定义
│   │   └── utils/         # 工具函数
│   ├── .env.*             # 环境变量配置
│   └── vite.config.ts     # Vite 配置
│
├── backend/                # 后端项目目录（独立的npm项目）
│   ├── package.json        # 后端依赖配置
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── dto/           # 接口之间的一些中间结果定义
│   │   ├── controllers/   # 控制器
│   │   ├── middlewares/   # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── repositories/  # 数据库操作层
│   │   ├── routes/        # 路由
│   │   ├── services/      # 业务服务
│   │   ├── schemas/       # 各种接口的参数校验结构定义
│   │   ├── types/         # TypeScript 类型定义
│   │   └── utils/         # 工具函数
│   └── .env.*             # 环境变量配置
```

## 2. 编码规范

### 2.1 通用规范

- 使用 ESM 模块系统，禁止使用 CommonJS
- 使用 TypeScript 开发，保持类型安全
- 代码格式化使用 Prettier
- 代码检查使用 ESLint
- 提交前使用 Husky 进行代码检查
- 使用 commitlint 规范提交信息
- 所有后端接口路由统一使用/api/开头
- 实体基础的 service 禁止直接调用别的实体的 repository，而应该是调用对应实体的 service 中的方法，如果没有，则在对应的 service 中添加方法，避免循环依赖，以及事务问题

### 2.2 UI 规范

#### 2.2.1 交互规范

##### Loading 状态

- 页面加载使用全局 Loading
- 按钮加载使用内置 Loading
- 列表加载使用占位图（Skeleton）
- 图片加载使用渐进式加载或模糊加载

##### 过渡动画

- 使用 CSS Transition 实现简单动画

- 使用 Framer Motion 实现复杂动画

- 动画时长规范：

  ```typescript
  export const animation = {
    durations: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
    },
    easings: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    }
  };
  ```

##### 表单交互

- 实时验证
- 清晰的错误提示
- 合理的键盘操作
- 支持表单自动填充
- 移动端适配软键盘

##### 手势交互

- 支持触摸滑动
- 支持下拉刷新
- 支持上拉加载
- 支持双指缩放（图片查看）

#### 2.2.2 性能优化

##### 图片优化

- 使用 next/image 或自定义图片组件
- 支持响应式图片
- 支持渐进式加载
- 使用 WebP 格式

##### 组件优化

- 合理使用 React.memo
- 使用 Intersection Observer 实现懒加载
- 长列表使用虚拟滚动
- 大型表单拆分为多个子组件

##### 动画优化

- 使用 transform 代替位置属性
- 使用 will-change 提示浏览器
- 避免重绘和回流
- 动画帧数保持在 60fps

#### 2.2.2 移动端适配

- 采用移动优先设计
- 支持触摸手势
- 适配软键盘
- 适配安全区域
- 优化网络请求

#### 2.2.4 开发规范

##### 组件开发规范

- 组件必须是 TypeScript
- 必须编写组件文档
- 必须包含测试用例
- 遵循 React Hooks 最佳实践

##### 样式开发规范

- 使用 CSS Modules 或 Tailwind CSS
- 避免内联样式
- 遵循 BEM 命名规范（使用 CSS Modules 时）
- 使用相对单位（rem/em）

#### 2.2.5 命名规范

- 文件名：使用 kebab-case (如: user-service.ts)
- 组件名：使用 PascalCase (如: UserProfile.tsx)
- 变量名：使用 camelCase
- 常量名：使用 UPPER_SNAKE_CASE
- 接口名：使用 PascalCase，以 I 开头 (如: IUserService)
- 类型名：使用 PascalCase，以 T 开头 (如: TUserData)

### 2.3 数据库规范

#### 2.3.1 PostgreSQL 规范

- 表命名：统一使用 t\_ 前缀，采用下划线命名法（如：t_user）
- 字段命名：统一使用 f\_ 前缀，采用下划线命名法（如：f_user_name）
- 主键：使用雪花算法生成 ID，字段名为 f_id
- 必备字段：
  - f_created_at：创建时间
  - f_updated_at：更新时间
  - f_created_by：创建者
  - f_updated_by：更新者
  - f_is_deleted：软删除标记

#### 2.3.2 数据库分层架构

##### 2.3.2.1 数据库初始化代码

```javascript
import { Sequelize } from 'sequelize';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const dbType = process.env.DB_TYPE || 'sqlite';

let sequelizeConfig;

if (dbType === 'sqlite') {
  sequelizeConfig = {
    dialect: 'sqlite',
    storage: process.env.SQLITE_FILE,
    logging: (msg: string) => logger.info('Sequelize Log:', msg),
    dialectOptions: {
    // 启用 WAL 模式，提供更好的并发性能
      pragma: {
        'journal_mode': 'WAL',
        'synchronous': 'FULL'  // 确保数据实时写入磁盘
      }
    },
  };
} else {
  sequelizeConfig = {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: (msg: string) => logger.info('Sequelize Log:', msg),
    dialectOptions: {
      connectTimeout: 10000
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 3000,
      idle: 1000
    }
  };
}

export const sequelize = new Sequelize(sequelizeConfig);

// Database initialization function
export async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info(`Successfully connected to ${dbType} database`);

    // Sync all models
    await sequelize.sync();
    logger.info('Database synchronized successfully');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
}
```

##### 2.3.2.2 Model 层

- Model 层负责定义数据结构和基本验证规则
- 使用 Sequelize Model 定义数据模型
- 示例代码：

```typescript
// /backend/src/models/order.model.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../config/database';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

interface OrderAttributes {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

interface OrderCreationAttributes extends Omit<OrderAttributes, 'id'> {}

export class Order extends Model<OrderAttributes, OrderCreationAttributes> {
  public id!: string;
  public orderNumber!: string;
  public totalAmount!: number;
  public status!: OrderStatus;
  public createdAt!: Date;
  public updatedAt!: Date;
  public createdBy!: string;
  public updatedBy!: string;
  public isDeleted!: boolean;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 't_order',
    timestamps: true,
  }
);
```

##### 2.3.2.2 Repository 层

- Repository 层负责数据访问的具体实现
- 封装所有数据库操作
- 实现事务管理
- 处理复杂查询逻辑

```typescript
// /backend/src/repositories/base.repository.ts
import { Model, ModelStatic } from 'sequelize';
import { sequelize } from '../config/database';

export abstract class BaseRepository<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  // 通用CRUD方法
  async create(data: any): Promise<T> {
    return this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne({
      where: { id, isDeleted: false },
    });
  }

  async findAll(params: any = {}): Promise<T[]> {
    return this.model.findAll({
      where: { isDeleted: false, ...params },
    });
  }

  async update(id: string, data: any): Promise<[number, T[]]> {
    return this.model.update(
      { ...data, updatedAt: new Date() },
      { where: { id }, returning: true }
    );
  }

  async softDelete(id: string): Promise<[number, T[]]> {
    return this.model.update(
      { isDeleted: true, updatedAt: new Date() },
      { where: { id }, returning: true }
    );
  }
}

// /backend/src/repositories/order.repository.ts
import { Order, OrderStatus } from '../models/order.model';
import { BaseRepository } from './base.repository';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(Order);
  }

  // 特定的业务查询方法
  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.model.findAll({
      where: { status, isDeleted: false },
    });
  }

  // 事务示例
  async createOrderWithItems(
    orderData: any,
    items: Array<any>
  ): Promise<Order> {
    return sequelize.transaction(async (t) => {
      // 创建订单
      const order = await this.model.create(orderData, { transaction: t });

      // 创建订单项
      await OrderItem.bulkCreate(
        items.map(item => ({
          orderId: order.id,
          ...item
        })),
        { transaction: t }
      );

      return order;
    });
  }
}
```

##### 2.3.2.3 事务管理

- 事务必须在 Repository 层实现
- 使用 Sequelize 的事务 API
- 遵循 ACID 原则
- 事务使用规范：

```typescript
// 事务处理示例
async function complexBusinessOperation() {
  return await sequelize.transaction(async (t) => {
    // 事务操作1
    const result1 = await Model1.create({...}, { transaction: t });

    // 事务操作2
    const result2 = await Model2.update({...}, {
      where: {...},
      transaction: t
    });

    // 如果任何操作失败，整个事务将回滚
    return result2;
  });
}
```

##### 2.3.2.4 查询优化

- 使用 Sequelize 的 include 和 attributes 优化查询
- 合理使用索引
- 分页查询必须使用 limit/offset 分页
- 大数据量查询使用流式查询

```typescript
// 查询优化示例
async function optimizedQuery() {
  // 使用 attributes 只获取需要的字段
  const result = await Order.findAll({
    attributes: ['id', 'orderNumber', 'totalAmount'],
    where: {
      isDeleted: false,
    },
    limit: 10,
    offset: 0,
  });

  // 使用 include 处理关联查询
  const orderWithItems = await Order.findOne({
    where: { id: orderId },
    include: [
      {
        model: OrderItem,
        attributes: ['id', 'quantity', 'price'],
      },
      {
        model: Customer,
        attributes: ['id', 'name'],
      },
    ],
  });

  // 使用流式查询处理大数据量
  const stream = await Order.findAll({
    where: { /* 查询条件 */ },
    raw: true,
  }).stream();

  stream.on('data', (order) => {
    // 处理每个订单数据
  });

  stream.on('end', () => {
    // 处理完成
  });
}
```

#### 2.3.3 Redis 规范

- Key 命名规范：`{业务模块}:{业务子模块}:{数据类型}:{标识符}`

  - 示例：`user:profile:hash:1234`
  - 示例：`order:pending:set:20241120`
  - 示例：`system:config:string:app_name`

- 数据类型使用规范：

  - string：适用于简单的键值对
  - hash：适用于对象存储
  - set：适用于无序集合
  - zset：适用于有序集合
  - list：适用于队列或栈

- 过期时间设置：

  - 所有缓存键必须设置过期时间
  - 过期时间通过配置文件统一管理
  - 特殊情况可单独设置，但需注释说明

- 常见业务场景规范：

  - 用户会话：`session:token:string:{token}`
  - 验证码：`verify:code:string:{业务类型}:{手机号/邮箱}`
  - 接口限流：`ratelimit:api:hash:{ip}:{api}`
  - 排行榜：`rank:score:zset:{排行类型}`
  - 计数器：`counter:daily:string:{业务类型}:{日期}`

- 操作规范：

  - 禁止使用 KEYS 命令
  - 大量数据操作使用 SCAN 命令
  - Pipeline 批量操作
  - 使用 Redis 事务确保操作原子性

- 监控指标：
  - 配置内存警告阈值
  - 监控缓存命中率
  - 监控慢查询
  - 监控连接数

## 3. 文档规范

### 3.1 代码注释规范

```typescript
/**
 * @description 方法描述
 * @param {string} param1 - 参数1描述
 * @param {number} param2 - 参数2描述
 * @returns {Promise<void>} 返回值描述
 * @throws {Error} 可能抛出的错误
 * @author 作者
 * @date 2024-11-20
 */
```

### 3.2 API 文档规范

- 使用 Swagger/OpenAPI 规范
- 每个接口必须包含：
  - 接口描述
  - 请求方法
  - 请求参数
  - 响应格式
  - 错误码说明

## 4. 异常处理规范

### 4.1 后端异常处理

- 统一使用自定义的异常处理中间件
- 定义标准的错误码体系
- 响应格式统一：

```typescript
interface ApiResponse {
  code: number;        // 错误码
  message: string;     // 错误信息
  data?: any;          // 具体返回的数据
  time: number;        // 时间戳
  requestId: string;   // 请求ID
}
```

### 4.2 前端异常处理

- 全局错误边界处理
- API 请求错误统一处理
- 使用 try-catch 处理可预见的错误

## 5. 日志规范

### 5.1 日志配置

- 使用 winston 作为日志框架
- 日志分级：ERROR、WARN、INFO、DEBUG
- 日志格式：

```typescript
{
  timestamp: string;    // 时间戳
  level: string;       // 日志级别
  message: string;     // 日志信息
  module: string;      // 模块名
  requestId: string;   // 请求ID
  metadata: any;       // 元数据
}
```

### 5.2 日志存储

- 错误日志单独存储
- 按天分割日志文件
- 设置日志保留期限
- 生产环境配置日志监控告警

## 6. 安全规范

### 6.1 认证授权

- 使用 JWT 进行身份认证
- 实现 RBAC 权限模型
- 实现防重放攻击机制

### 6.2 数据安全

- 敏感数据加密存储
- 使用参数化查询防止 SQL 注入
- 实现请求参数验证
- 设置适当的 CORS 策略

## 7. 性能优化规范

### 7.1 前端优化

- 路由懒加载
- 图片懒加载
- 组件按需加载
- 合理使用缓存策略
- 使用 Web Workers 处理复杂计算

### 7.2 后端优化

- 使用数据库索引
- 实现缓存机制
- 合理使用连接池
- 实现请求限流
- 大文件处理使用流式传输
