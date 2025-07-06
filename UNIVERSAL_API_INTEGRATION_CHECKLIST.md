# Universal API Integration Checklist

## 🚨 CRITICAL ISSUES TO AVOID

### 1. SERVER RESTART FAILURES
- [ ] Always restart server after code changes
- [ ] Use `pkill -f "node server.js" && npm start` to force restart
- [ ] Check startup logs to confirm restart actually happened
- [ ] Kill existing processes: `lsof -ti:PORT | xargs kill -9`
- [ ] Use nodemon for auto-restart in development

### 2. API COMPATIBILITY ISSUES
- [ ] Test API with known working data first
- [ ] Research API's specific input format requirements
- [ ] Implement data preprocessing/normalization
- [ ] Handle edge cases (file sizes, formats, encoding)
- [ ] Test with curl/Postman before coding

### 3. AUTHENTICATION PROBLEMS
- [ ] Verify credentials with simple endpoint first
- [ ] Check authentication method (Bearer, Basic, API Key)
- [ ] Validate credential format and encoding
- [ ] Test account/status endpoint before main functionality
- [ ] Store credentials securely (environment variables)

### 4. DEPENDENCY MANAGEMENT
- [ ] Install all required packages before testing
- [ ] Check package.json for missing dependencies
- [ ] Use specific versions to avoid compatibility issues
- [ ] Test after each new dependency installation
- [ ] Document all required dependencies

---

## 📋 UNIVERSAL API INTEGRATION CHECKLIST

### PHASE 1: API VERIFICATION
- [ ] Obtain valid API credentials
- [ ] Read API documentation thoroughly
- [ ] Test credentials with account/status endpoint
- [ ] Verify rate limits and usage quotas
- [ ] Test with curl/Postman first
- [ ] Document all endpoints and parameters

### PHASE 2: BASIC INTEGRATION
- [ ] Set up basic server framework
- [ ] Create health check endpoint
- [ ] Implement credential validation function
- [ ] Add comprehensive logging for debugging
- [ ] Test minimal API call first
- [ ] Handle basic error responses

### PHASE 3: DATA HANDLING
- [ ] Set up proper data input handling
- [ ] Implement data validation and sanitization
- [ ] Add file size limits and type checking
- [ ] Handle different input formats
- [ ] Test with various data types
- [ ] Implement proper error handling

### PHASE 4: API COMPATIBILITY
- [ ] Research API's specific requirements
- [ ] Implement data preprocessing if needed
- [ ] Test with known working data formats
- [ ] Handle API-specific edge cases
- [ ] Add format conversion pipeline
- [ ] Test error scenarios

### PHASE 5: PRODUCTION READINESS
- [ ] Switch from test/dev mode to production
- [ ] Implement comprehensive error handling
- [ ] Add rate limiting and timeout handling
- [ ] Create user-friendly error messages
- [ ] Test complete end-to-end workflow
- [ ] Monitor API usage and costs

---

## 🛠 TECHNICAL IMPLEMENTATION PATTERNS

### API Call Structure
```javascript
// Standard API call pattern
const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    timeout: 30000
});
```

### Error Handling Pattern
```javascript
// Robust error handling
if (response.ok) {
    const result = await response.json();
    // Process success
} else {
    let errorData;
    try {
        errorData = await response.json();
    } catch (e) {
        errorData = { message: await response.text() };
    }
    // Handle specific error
}
```

### Data Preprocessing Template
```javascript
// Generic data preprocessing
async function preprocessData(inputData) {
    try {
        // Validate input
        // Convert format if needed
        // Apply size/type limits
        // Return processed data
    } catch (error) {
        // Return original or throw error
    }
}
```

---

## 🔍 DEBUGGING STRATEGIES

### Server Issues
1. Check if server is running: `lsof -i :PORT`
2. Look for startup logs and error messages
3. Test health endpoint: `curl http://localhost:PORT/health`
4. Restart server completely, don't assume auto-restart
5. Check for port conflicts

### API Issues
1. Test credentials with simple endpoint first
2. Use curl to test API directly
3. Check API response headers for clues
4. Log all request/response data
5. Verify API endpoint URLs and methods
6. Check for rate limiting or quota issues

### Data Processing Issues
1. Validate input data format and structure
2. Test with simple, known-good data first
3. Check for encoding or format issues
4. Verify data size limits
5. Test preprocessing pipeline separately

---

## 📝 MEGA PROMPT FOR ANY API PROJECT

```
API Integration Checklist:

1. VERIFY FIRST: Test API credentials with simple endpoint
2. START SIMPLE: Use curl/Postman before writing code
3. LOG EVERYTHING: Add comprehensive logging for debugging
4. TEST INCREMENTALLY: Build and test one feature at a time
5. HANDLE FORMATS: Research API's specific requirements
6. PREPROCESS DATA: Normalize/convert data as needed
7. RESTART SERVERS: Always restart after code changes
8. CHECK RESPONSES: Validate both success and error responses
9. MONITOR USAGE: Track API calls, limits, and costs
10. FALLBACK GRACEFULLY: Provide meaningful error messages

Critical gotchas:
- Server not restarting after changes
- API format requirements not clearly documented
- Authentication header formatting issues
- Missing dependencies after adding features
- Data format compatibility problems
- Rate limiting and timeout issues
- Error response format variations
- Environment-specific configuration differences
```

---

## ✅ SUCCESS VALIDATION

### Technical Validation
- [ ] API credentials validated and working
- [ ] Real API integration functional (not mock)
- [ ] Data preprocessing pipeline working
- [ ] Error handling comprehensive
- [ ] End-to-end workflow tested
- [ ] Performance acceptable
- [ ] Security considerations addressed

### User Experience Validation
- [ ] User interface intuitive and responsive
- [ ] Error messages clear and helpful
- [ ] Processing feedback provided
- [ ] Results delivered as expected
- [ ] Edge cases handled gracefully

### Production Readiness
- [ ] All dependencies documented
- [ ] Configuration externalized
- [ ] Logging comprehensive
- [ ] Error monitoring in place
- [ ] Performance monitoring enabled
- [ ] Security review completed
