# AIGC File Detection API

## 获取上传签名

获取文件上传所需的签名信息。

### 接口地址

```
POST /api/detection/file/signature
```

### 请求参数

#### Headers

```
Content-Type: application/json
```

### 请求示例

```bash
curl -X POST 'http://localhost:3000/api/detection/file/signature' \
-H 'Content-Type: application/json'
```

### 响应示例

```json
{
  "code": 200,
  "message": "Upload signature generated successfully",
  "data": {
    "ossurl": "https://similar-center.icloudobs.com",
    "ossid": "48b05cdb-f4e0-4b72-8211-09b821621ee3",
    "ossAccessKeyId": "HBDT3R50QARZFDNEE0FT",
    "policy": "eyJleHBpcmF0aW9uIjoiMjAyNC0xMS0yOVQwMToyMzo1Mi40NDJaIiwiY29...",
    "signature": "DtDv1CUO4hbZVfzEuEiEtyGH/9g=",
    "ossKey": "upload/48b05cdb-f4e0-4b72-8211-09b821621ee3"
  },
  "timestamp": 1732787203695
}
```

## 解析文档

解析上传文档的字数信息。

### 接口地址

```
POST /api/detection/file/parse
```

### 请求示例

```bash
curl -X POST 'http://localhost:3000/api/detection/file/parse' \
-H 'Content-Type: application/json' \
-d '{
  "taskId": "48b05cdb-f4e0-4b72-8211-09b821621ee3",
  "fileType": "pdf"
}'
```

### 响应示例

```json
{
  "code": 200,
  "message": "Document parsed successfully",
  "data": {
    "taskId": "48b05cdb-f4e0-4b72-8211-09b821621ee3",
    "wordCount": 5678
  },
  "timestamp": 1732787203695
}
```

## 提交检测任务

提交文档进行AIGC检测。

### 接口地址

```
POST /api/detection/file/submit
```

### 请求示例

```bash
curl -X POST 'http://localhost:3000/api/detection/file/submit' \
-H 'Content-Type: application/json' \
-d '{
  "taskId": "48b05cdb-f4e0-4b72-8211-09b821621ee3",
  "userId": "user-123",
  "title": "研究论文.pdf",
  "wordCount": 5678
}'
```

### 响应示例

```json
{
  "code": 200,
  "message": "Detection submitted successfully",
  "data": {
    "taskId": "48b05cdb-f4e0-4b72-8211-09b821621ee3"
  },
  "timestamp": 1732787203695
}
```

## 查询检测结果

查询一个或多个检测任务的结果。

### 接口地址

```
POST /api/detection/file/query
```

### 请求示例

```bash
curl -X POST 'http://localhost:3000/api/detection/file/query' \
-H 'Content-Type: application/json' \
-d '{
  "taskIds": ["48b05cdb-f4e0-4b72-8211-09b821621ee3"]
}'
```

### 响应示例

```json
{
  "code": 200,
  "message": "Results retrieved successfully",
  "data": {
    "results": [
      {
        "taskId": "48b05cdb-f4e0-4b72-8211-09b821621ee3",
        "state": 3,
        "similarity": 0.85,
        "similarityHigh": 0.65,
        "similarityMedium": 0.15,
        "similarityLow": 0.05,
        "similarityUncheck": 0.15,
        "zipurl": "https://similar-center.icloudobs.com/reports/48b05cdb-f4e0-4b72-8211-09b821621ee3.zip",
        "reportTime": "2024-03-27T10:30:15Z"
      }
    ]
  },
  "timestamp": 1732787203695
}
```

## 分页查询检测记录

查询用户的检测任务记录。

### 接口地址

```
POST /api/detection/task/list
```

### 请求参数

#### Headers

```
Content-Type: application/json
```

#### Body

```json
{
  "userId": "user-123",        // 用户ID
  "pageNum": 1,               // 页码，从1开始
  "pageSize": 10,             // 每页条数
  "startTime": "2024-03-27T00:00:00Z",  // 可选，开始时间
  "endTime": "2024-03-27T23:59:59Z",    // 可选，结束时间
  "status": 3                 // 可选，检测状态：0-待提交,1-已提交,2-检测中,3-已完成,-1-失败
}
```

### 响应示例

```json
{
  "code": 200,
  "message": "Detection history retrieved successfully",
  "data": {
    "total": 100,       // 总记录数
    "pages": 10,        // 总页数
    "list": [
      {
        "id": "task-123",
        "title": "研究论文.pdf",
        "wordCount": 5678,
        "createTime": "2024-03-27T10:30:15Z",
        "status": 3,
        "similarity": 0.85,
        "similarityHigh": 0.65,
        "similarityMedium": 0.15,
        "similarityLow": 0.05,
        "similarityUncheck": 0.15,
        "reportUrl": "https://example.com/reports/task-123.zip",
        "reportTime": "2024-03-27T10:35:15Z",
        "sourceFileUrl": "https://example.com/uploads/task-123.pdf",
        "sourceFileType": "pdf",
        "errorMsg": null
      }
    ]
  },
  "timestamp": 1732787203695
}
```

## 错误响应示例

```json
{
  "code": 400,
  "message": "文件类型不支持，仅支持PDF、Word和TXT格式",
  "timestamp": 1732787203695
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 400001 | 参数验证失败 |
| 400002 | 文件类型不支持 |
| 400003 | 文件大小超限 |
| 400004 | 解析文档失败 |
| 400005 | 提交检测失败 |
| 400006 | 查询结果失败 |
| 400007 | 查询历史记录失败 |

## 注意事项

1. 文件上传限制：
   - 支持的文件类型：PDF、Word、TXT
   - 最大文件大小：30MB
   - 文件名必须包含扩展名

2. 检测流程：
   - 先获取上传签名
   - 使用签名上传文件
   - 解析文档字数
   - 提交检测任务
   - 轮询查询结果

3. 任务状态说明：
   - 0：等待中
   - 1：检测中
   - 2：已检测
   - 3：已完成
   - -1：失败

4. 建议的轮询间隔：
   - 首次查询：提交后5秒
   - 后续查询：每10秒一次
   - 超时时间：5分钟

5. 分页查询说明：
   - pageNum从1开始
   - pageSize默认为10，最大100
   - 时间过滤为可选项
   - 状态过滤为可选项