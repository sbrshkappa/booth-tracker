# Booth Tracker API - Postman Collection

This document provides instructions for importing and using the Postman collection to test all APIs in the Booth Tracker application.

## 📁 Files Included

- `Booth-Tracker-API.postman_collection.json` - The complete Postman collection
- `POSTMAN_SETUP.md` - This setup guide

## 🚀 Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop `Booth-Tracker-API.postman_collection.json` or click **Upload Files** and select it
4. The collection will appear in your Postman workspace

### 2. Configure Environment Variables

The collection uses a `baseUrl` variable that defaults to `http://localhost:3000`. To configure it:

1. Click on the collection name "Booth Tracker API"
2. Go to the **Variables** tab
3. Update the `baseUrl` value:
   - **Local development**: `http://localhost:3000`
   - **Production**: Your deployed URL (e.g., `https://your-app.vercel.app`)

### 3. Test the APIs

The collection is organized into 5 main categories:

## 📋 API Categories

### 1. User Management
- **Register User** - Create a new user account
- **Login User** - Authenticate user and get progress
- **Check Admin Status** - Verify admin privileges

### 2. Booth Operations
- **Get All Booths** - Retrieve all available booths
- **Visit Booth** - Record a booth visit with optional notes/rating
- **Update Booth Rating** - Modify rating for a visit
- **Update Visit Notes** - Edit notes for a visit

### 3. Admin Operations
- **Create Booth** - Add new booth (Admin only)
- **Update Booth** - Modify booth details (Admin only)
- **Delete Booth** - Remove booth (Admin only)
- **Delete User** - Remove user account (Admin only)
- **Write to Google Sheet** - Export data to Google Sheets (Admin only)

### 4. Session Management
- **Get Sessions** - Retrieve sessions with optional filters
- **Get Session Notes** - Fetch notes for a specific session
- **Save Session Notes** - Store/update session notes

### 5. Email & Communication
- **Send Visit Notes Email** - Share journey summary via email

## 🔧 Testing Workflow

### Basic User Flow
1. **Register User** - Create a test user account
2. **Login User** - Authenticate and get user progress
3. **Get All Booths** - See available booths
4. **Visit Booth** - Test booth visit functionality
5. **Update Booth Rating** - Modify a visit rating
6. **Get Sessions** - View available sessions
7. **Save Session Notes** - Add notes to a session

### Admin Flow
1. **Check Admin Status** - Verify admin access
2. **Create Booth** - Add a new booth
3. **Update Booth** - Modify booth details
4. **Write to Google Sheet** - Export data

## 📝 Example Request Bodies

### Register User
```json
{
  "email": "test@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "badge_number": "12345"
}
```

### Visit Booth
```json
{
  "phrase": "booth-phrase-here",
  "userEmail": "test@example.com",
  "notes": "Great booth experience!",
  "rating": 5
}
```

### Get Sessions (with filters)
```
GET /api/getSessions?day=monday&type=workshop&children_friendly=true
```

## 🛠️ Environment Setup

### Local Development
1. Start your Next.js development server:
   ```bash
   cd frontend
   npm run dev
   ```
2. Set `baseUrl` to `http://localhost:3000`

### Production Testing
1. Deploy your application
2. Set `baseUrl` to your production URL
3. Ensure all environment variables are configured

## 🔍 Common Test Scenarios

### 1. User Registration Flow
- Test with valid data
- Test with duplicate email (should return 409)
- Test with missing required fields (should return 400)

### 2. Booth Visit Flow
- Test with valid booth phrase
- Test with invalid phrase (should return 404)
- Test duplicate visit (should return 409)
- Test with and without optional fields (notes, rating)

### 3. Admin Operations
- Test admin-only endpoints with non-admin user
- Test booth creation with valid data
- Test booth updates and deletions

### 4. Session Management
- Test session retrieval with different filters
- Test note saving and retrieval
- Test session filtering by day, type, and children-friendly status

## 🚨 Error Handling

The collection includes examples of common error scenarios:

- **400 Bad Request** - Missing required fields, invalid data
- **404 Not Found** - User/booth not found
- **409 Conflict** - Duplicate entries
- **500 Internal Server Error** - Server-side issues

## 📊 Response Examples

### Successful User Registration
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "test@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

### Successful Booth Visit
```json
{
  "success": true,
  "message": "Booth visit recorded successfully",
  "data": {
    "visit": { ... },
    "booth": { ... },
    "user": { ... },
    "progress": {
      "visited": 3,
      "total": 10,
      "remaining": 7
    },
    "isComplete": false
  }
}
```

## 🔐 Security Notes

- Admin endpoints require proper authentication
- Some endpoints use service role keys for backend operations
- Email endpoints may require proper SMTP configuration
- Google Sheets integration requires proper API credentials

## 📞 Support

If you encounter issues with the API testing:

1. Check that your development server is running
2. Verify environment variables are set correctly
3. Check the browser console for detailed error messages
4. Review the Supabase function logs for backend errors

## 🎯 Next Steps

After testing the APIs:

1. **Automate Tests** - Use Postman's test scripts to automate API testing
2. **Environment Variables** - Set up different environments for dev/staging/prod
3. **Documentation** - Add response examples and error codes to your API docs
4. **Monitoring** - Set up API monitoring for production endpoints

---

**Happy Testing! 🚀** 