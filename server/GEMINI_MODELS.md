# Gemini API Configuration

## Current Implementation

The system uses **Gemini Vision API** directly for image analysis and chat functionality.

### Model Fallback Strategy

The service automatically tries models in this order:
1. **`gemini-2.5-flash`** - Latest Flash model (fastest, recommended)
2. **`gemini-1.5-flash`** - Stable Flash model (fallback)
3. **`gemini-pro`** - Pro model (final fallback)

If one model fails (rate limit, unavailable, etc.), it automatically tries the next one.

### Rate Limiting

- **Rate Limit**: 12 requests per minute (conservative, below free tier limit of 15 RPM)
- **Request Queue**: All requests are queued and processed sequentially
- **Interval**: ~5 seconds between requests to prevent 429 errors

### Configuration

Set in `server/.env`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Free Tier Limits

- **15 requests per minute (RPM)**
- **1,500 requests per day (RPD)**
- No cost for usage within limits

Check your quota at: https://ai.google.dev/usage?tab=rate-limit

### Features

- ✅ Automatic model fallback
- ✅ Rate limiting and request queuing
- ✅ Vision API support (image analysis)
- ✅ Medical compliance system prompt
- ✅ Error handling with clear messages
