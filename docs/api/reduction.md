# AIGC File Reduction API

## Overview
This document describes the API endpoints for the AIGC file reduction service. The service provides functionality to reduce AI-generated content in documents and recheck the results.

Base URL: `/api/v1/reduction`

## Endpoints

### Submit Reduction Task

Submits a document for content reduction based on a completed detection task.

```http
POST /api/v1/reduction/submit
```

#### Request Body
```json
{
  "taskId": "string",      // Required: Detection task ID
  "userId": "string",      // Required: User ID
  "title": "string",       // Required: Document title
  "wordCount": number      // Required: Document word count
}
```

#### Response
```json
{
  "code": 200,
  "message": "Reduction submitted successfully",
  "data": {
    "taskId": "string"    // Reduction task ID
  },
  "timestamp": 1732787203695
}
```

### Query Reduction Results

Retrieves the results for one or more reduction tasks.

```http
POST /api/v1/reduction/query
```

#### Request Body
```json
{
  "taskIds": ["string"]   // Required: Array of reduction task IDs
}
```

#### Response
```json
{
  "code": 200,
  "message": "Results retrieved successfully",
  "data": {
    "results": [
      {
        "taskId": "string",       // Reduction task ID
        "state": number,          // Task status (0-3, -1)
        "reduceUrl": "string",    // URL to download reduced document
        "recheckUrl": "string",   // URL to download recheck report
        "reduceRate": number,     // Reduction rate percentage
        "processTime": number     // Processing time in seconds
      }
    ]
  },
  "timestamp": 1732787203695
}
```

### Get Reduction History

Retrieves the reduction task history for a user.

```http
POST /api/v1/reduction/task/list
```

#### Request Body
```json
{
  "userId": "string",        // Required: User ID
  "pageNum": number,         // Optional: Page number (default: 1)
  "pageSize": number,        // Optional: Page size (default: 10)
  "startTime": "string",     // Optional: Start time (ISO 8601)
  "endTime": "string",       // Optional: End time (ISO 8601)
  "status": number          // Optional: Task status filter
}
```

#### Response
```json
{
  "code": 200,
  "message": "Reduction history retrieved successfully",
  "data": {
    "total": number,         // Total number of records
    "pages": number,         // Total number of pages
    "list": [
      {
        "id": "string",              // Task ID
        "title": "string",           // Document title
        "wordCount": number,         // Word count
        "createTime": "string",      // Creation time
        "status": number,            // Reduction status
        "detectionId": "string",     // Related detection task ID
        "detectionStatus": number,   // Detection task status
        "reduceUrl": "string",       // Reduced document URL
        "recheckUrl": "string",      // Recheck report URL
        "reduceRate": number,        // Reduction rate percentage
        "processTime": number,       // Processing time in seconds
        "errorMsg": "string"         // Error message if failed
      }
    ]
  },
  "timestamp": 1732787203695
}
```

## Status Codes

### Reduction Task Status
| Code | Description |
|------|-------------|
| 0    | Waiting (Detection not completed) |
| 1    | Pending (Ready for reduction) |
| 2    | Processing |
| 3    | Completed |
| -1   | Failed |

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 500  | Internal Server Error |

## Error Response
```json
{
  "code": 400,
  "message": "Error message describing what went wrong",
  "timestamp": 1732787203695
}
```

## Notes

1. File Reduction Process:
   - A detection task must be completed before reduction
   - The system automatically rechecks the reduced content
   - Results include both reduced document and recheck report

2. File Limitations:
   - Supported file types: PDF, DOC, DOCX, TXT
   - Maximum file size: 30MB
   - File names must include extension

3. Task Flow:
   - Submit reduction task
   - Poll for task status
   - Download results when complete

4. Best Practices:
   - Poll status every 5-10 seconds
   - Set timeout after 5 minutes
   - Handle failed tasks with retry mechanism