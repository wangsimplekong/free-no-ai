# SMS发送接口文档

## 基本信息

- **接口名称**：发送短信
- **接口描述**：用于发送短信验证码等内容
- **接口URL**：http://test.gateway.laibokeji.com/lb-sms-server/internal/sms/send
- **请求方式**：POST
- **数据格式**：application/x-www-form-urlencoded

## 请求参数

| 参数名       | 类型   | 必填 | 描述                   | 示例值              |
| ------------ | ------ | ---- | ---------------------- | ------------------- |
| key          | String | 是   | 接口调用密钥           | JATMW4RT            |
| templateCode | String | 是   | 短信模板代码           | 1861228865963352066 |
| mobile       | String | 是   | 接收手机号             | 18888888888         |
| appName      | String | 是   | 应用名称               | chatOK              |
| content      | String | 是   | 短信内容参数(JSON格式) | {"code":"234567"}   |

### content参数说明

content参数需要传递JSON格式的字符串，需要URL编码。 示例内容：

```
{
    "code": "234567"
}
```

## 请求示例

```
http://test.gateway.laibokeji.com/lb-sms-server/internal/sms/send?key=JATMW4RT&templateCode=1861228865963352066&mobile=18888888888&appName=chatOK&content=%7B%22code%22:%22234567%22%7D
```

## 响应参数

好的，我来更新接口文档的响应部分：

## 响应结构

### 响应示例

```
{
    "code": 0,
    "msg": "发送成功",
    "data": {
        "id": "1861232176070320129",
        "mobile": "18888888888",
        "appName": "chatOK",
        "templateId": "sms_login",
        "smsType": "aliyun",
        "content": "{\"code\":\"234567\"}",
        "createTime": "2024-11-26 10:15:05",
        "state": 0,
        "result": "{\"code\":\"Operation.Success\",\"data\":\"{\\\"content\\\":\\\"欢迎使用手机注册账号,您的验证码是：234567，请使用该号码完成通行账号注册。如非本人操作，请忽略！\\\",\\\"chargedCount\\\":1}\",\"eventId\":\"event_aaaade3gia5sdnlhm5umncgssgri53owqgqio5a\",\"message\":\"Operation.Success\",\"requestId\":\"A462C810-E42D-5D71-82B2-C9B04882250D\",\"success\":true}",
        "templateCode": "1861228865963352066"
    },
    "time": 1732587305459
}
```

### 响应参数说明

| 参数名 | 类型    | 描述                     |
| ------ | ------- | ------------------------ |
| code   | Integer | 响应码：0-成功，非0-失败 |
| msg    | String  | 响应消息                 |
| time   | Long    | 响应时间戳               |
| data   | Object  | 响应数据对象             |

### data对象参数说明

| 参数名       | 类型    | 描述                               |
| ------------ | ------- | ---------------------------------- |
| id           | String  | 短信记录ID                         |
| mobile       | String  | 接收手机号                         |
| appName      | String  | 应用名称                           |
| templateId   | String  | 模板ID                             |
| smsType      | String  | 短信服务提供商类型（如：aliyun）   |
| content      | String  | 发送的内容参数(JSON格式)           |
| createTime   | String  | 创建时间                           |
| state        | Integer | 发送状态：0-成功                   |
| result       | String  | 短信服务商返回的详细结果(JSON格式) |
| templateCode | String  | 短信模板代码                       |

### result对象参数说明（解析后）

```
{
    "code": "Operation.Success",
    "data": {
        "content": "欢迎使用手机注册账号,您的验证码是：234567，请使用该号码完成通行账号注册。如非本人操作，请忽略！",
        "chargedCount": 1
    },
    "eventId": "event_aaaade3gia5sdnlhm5umncgssgri53owqgqio5a",
    "message": "Operation.Success",
    "requestId": "A462C810-E42D-5D71-82B2-C9B04882250D",
    "success": true
}
```

| 参数名            | 类型    | 描述               |
| ----------------- | ------- | ------------------ |
| code              | String  | 服务商响应代码     |
| data.content      | String  | 实际发送的短信内容 |
| data.chargedCount | Integer | 计费条数           |
| eventId           | String  | 服务商事件ID       |
| message           | String  | 服务商响应消息     |
| requestId         | String  | 服务商请求ID       |
| success           | Boolean | 服务商发送结果     |

### 状态码说明

| 状态码 | 说明                          |
| ------ | ----------------------------- |
| 0      | 成功                          |
| 非0    | 失败，具体错误信息参考msg字段 |

### 发送状态说明

| state值 | 说明     |
| ------- | -------- |
| 0       | 发送成功 |
| 其他值  | 发送失败 |

您觉得这个响应结构文档是否完整？需要补充或修改的地方吗？

##  注意事项

1. content参数需要进行URL编码
2. 手机号必须是有效的11位数字
3. 模板代码必须事先在系统中配置
4. 接口调用需要使用有效的key进行认证

## **请求示例**

好的，我来给出 TypeScript 和 Node.js 的请求示例代码：

### TypeScript 示例 (使用 axios)

```
// types.ts
interface SMSResponse {
  code: number;
  msg: string;
  data: {
    id: string;
    mobile: string;
    appName: string;
    templateId: string;
    smsType: string;
    content: string;
    createTime: string;
    state: number;
    result: string;
    templateCode: string;
  };
  time: number;
}

// sms.service.ts
import axios from 'axios';
import { URLSearchParams } from 'url';

class SMSService {
  private readonly baseUrl: string = 'http://test.gateway.laibokeji.com';
  private readonly apiKey: string = 'JATMW4RT';

  async sendSMS(
    mobile: string,
    code: string,
    templateCode: string = '1861228865963352066',
    appName: string = 'chatOK'
  ): Promise<SMSResponse> {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        templateCode,
        mobile,
        appName,
        content: JSON.stringify({ code })
      });

      const response = await axios.get<SMSResponse>(
        `${this.baseUrl}/lb-sms-server/internal/sms/send`,
        { params }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`SMS sending failed: ${error.message}`);
      }
      throw error;
    }
  }
}

// 使用示例
async function sendVerificationCode() {
  const smsService = new SMSService();
  try {
    const result = await smsService.sendSMS('18888888888', '234567');
    console.log('SMS sent successfully:', result);
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
}
```

### Node.js 示例

```
// 使用 node-fetch
const fetch = require('node-fetch');

// 方式1：使用 node-fetch
async function sendSMS(mobile, code) {
  const baseUrl = 'http://test.gateway.laibokeji.com';
  const params = new URLSearchParams({
    key: 'JATMW4RT',
    templateCode: '1861228865963352066',
    mobile,
    appName: 'chatOK',
    content: JSON.stringify({ code })
  });

  try {
    const response = await fetch(
      `${baseUrl}/lb-sms-server/internal/sms/send?${params}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

// 方式2：使用 axios
const axios = require('axios');

async function sendSMSWithAxios(mobile, code) {
  const baseUrl = 'http://test.gateway.laibokeji.com';
  const params = {
    key: 'JATMW4RT',
    templateCode: '1861228865963352066',
    mobile,
    appName: 'chatOK',
    content: JSON.stringify({ code })
  };

  try {
    const response = await axios.get(
      `${baseUrl}/lb-sms-server/internal/sms/send`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

// 方式3：使用原生 http 模块
const http = require('http');
const querystring = require('querystring');

function sendSMSWithHttp(mobile, code) {
  return new Promise((resolve, reject) => {
    const params = querystring.stringify({
      key: 'JATMW4RT',
      templateCode: '1861228865963352066',
      mobile,
      appName: 'chatOK',
      content: JSON.stringify({ code })
    });

    const options = {
      hostname: 'http://test.gateway.laibokeji.com',
      path: `/lb-sms-server/internal/sms/send?${params}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// 使用示例
async function test() {
  try {
    // 使用 node-fetch
    const result1 = await sendSMS('18888888888', '234567');
    console.log('SMS sent with node-fetch:', result1);

    // 使用 axios
    const result2 = await sendSMSWithAxios('18888888888', '234567');
    console.log('SMS sent with axios:', result2);

    // 使用原生 http
    const result3 = await sendSMSWithHttp('18888888888', '234567');
    console.log('SMS sent with http:', result3);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
```