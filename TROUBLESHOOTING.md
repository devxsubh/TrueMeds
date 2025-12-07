# Troubleshooting Network Errors

## Common Network Error Causes

### 1. **ML Service Not Running**
Make sure the ML service is running on port 8000:
```bash
cd ml_service
python app.py
# or
uvicorn app:app --host 0.0.0.0 --port 8000
```

Check if it's running:
```bash
curl http://localhost:8000/health
```

### 2. **Server Not Running**
Make sure the Node.js server is running:
```bash
cd server
npm run dev
```

Default port is 5000 (check your `.env` file).

### 3. **Port Mismatch**
Check your configuration:

**Server `.env`:**
```
PORT=5000
ML_SERVICE_URL=http://localhost:8000
```

**Client `.env` or `vite.config.js`:**
```
VITE_API_URL=http://localhost:5000
```

### 4. **CORS Issues**
Both services have CORS enabled, but if you're still getting CORS errors:

**ML Service** (`ml_service/app.py`):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # In production, specify your frontend URL
    allow_methods=['*'],
    allow_headers=['*'],
)
```

**Server** (`server/src/app.js`):
```javascript
app.use(cors());  // Already enabled
```

### 5. **Gemini API Key Missing**
Set the Gemini API key in ML service:

**Create `ml_service/.env`:**
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 6. **Image Storage Directory**
The ML service creates an `uploads/` directory automatically. If you get permission errors:

```bash
cd ml_service
mkdir -p uploads
chmod 755 uploads
```

### 7. **Check Service Health**

**ML Service:**
```bash
curl http://localhost:8000/health
```

**Server:**
```bash
curl http://localhost:5000/api/v1/ml/health
```

### 8. **Browser Console Errors**
Open browser DevTools (F12) and check:
- Network tab for failed requests
- Console tab for JavaScript errors
- Check the exact error message

### 9. **Common Error Messages**

**"ML service is unavailable"**
- ML service is not running
- Wrong `ML_SERVICE_URL` in server `.env`
- Firewall blocking port 8000

**"Failed to get response from Gemini"**
- `GEMINI_API_KEY` not set
- Invalid API key
- API quota exceeded
- Network issue connecting to Google

**"Image not found"**
- Image was not uploaded first
- Image expired (if you implement TTL)
- Wrong `imageId` sent

**"ECONNREFUSED"**
- Service not running
- Wrong port
- Firewall blocking

### 10. **Test Endpoints Manually**

**Upload Image:**
```bash
curl -X POST http://localhost:5000/api/v1/rag/upload-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_image.jpg"
```

**Chat:**
```bash
curl -X POST http://localhost:5000/api/v1/rag/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageId": "your-image-id", "message": "What do you see?"}'
```

### 11. **Check Logs**

**ML Service logs:**
- Check terminal where ML service is running
- Look for Python errors or warnings

**Server logs:**
- Check terminal where server is running
- Look for Node.js errors

**Browser Network Tab:**
- Check request/response details
- Look for status codes (400, 500, etc.)
- Check response body for error messages

## Quick Fix Checklist

- [ ] ML service running on port 8000
- [ ] Server running on port 5000 (or configured port)
- [ ] `GEMINI_API_KEY` set in `ml_service/.env`
- [ ] `ML_SERVICE_URL=http://localhost:8000` in server `.env`
- [ ] `VITE_API_URL=http://localhost:5000` in client (or default)
- [ ] CORS enabled in both services
- [ ] All dependencies installed (`pip install -r requirements.txt` and `npm install`)
- [ ] Browser console shows no JavaScript errors
- [ ] Network tab shows actual error (not just "Network Error")

## Still Having Issues?

1. Check all services are running:
   ```bash
   # Terminal 1: ML Service
   cd ml_service && python app.py
   
   # Terminal 2: Server
   cd server && npm run dev
   
   # Terminal 3: Client
   cd client && npm run dev
   ```

2. Test ML service directly:
   ```bash
   curl http://localhost:8000/health
   ```

3. Test server directly:
   ```bash
   curl http://localhost:5000/api/v1/ml/health
   ```

4. Check firewall/antivirus isn't blocking ports

5. Try restarting all services
