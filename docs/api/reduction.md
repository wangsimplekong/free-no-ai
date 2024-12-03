# AIGC Text Reduction API

## Reduce Text

Rewrites text content to make it more original while maintaining the core meaning.

### Endpoint

```
POST /api/v1/aigc/reduce/text
```

### Request

#### Headers

```
Content-Type: application/json
```

#### Body

```json
{
  "text": "string"    // Required: Text content to rewrite
}
```

#### Validation Rules

- Text is required
- Text must be a string
- Text length must be between 1 and 5000 characters

### Response

#### Success Response (200 OK)

```json
{
  "code": 200,
  "message": "Text reduction successful",
  "data": {
    "text": "string"    // The rewritten text content
  },
  "timestamp": 1732787203695
}
```

#### Error Response (400 Bad Request)

```json
{
  "code": 400,
  "message": "Error message describing what went wrong",
  "timestamp": 1732787203695
}
```

### Example

```bash
curl -X POST \
  http://localhost:3000/api/v1/aigc/reduce/text \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Text content to be rewritten for originality"
  }'
```

### Notes

- The API maintains the core meaning of the original text while improving originality
- The response includes the rewritten version of the input text
- The service uses advanced AI models to ensure natural and coherent rewriting
- Processing time may vary based on text length and complexity