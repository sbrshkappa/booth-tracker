# Google Sheets Integration Setup Guide

This guide will help you set up automatic writing of user completion data to Google Sheets when users complete all booths.

## 🎯 Overview

When a user completes visiting all booths, their data will automatically be written to a Google Sheet with the following information:
- User details (email, name, badge number)
- Registration and completion dates
- Progress statistics
- Complete visit history

## 📋 Prerequisites

1. **Google Account** - You need a Google account to create Google Sheets and Apps Script
2. **Supabase Project** - Your booth tracker backend should be set up
3. **Google Sheet** - A spreadsheet to store the completion data

## 🚀 Step-by-Step Setup

### Step 1: Create Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet
3. Rename the first sheet to "User Completions"
4. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```

### Step 2: Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default code with the content from `google-apps-script/Code.gs`
4. Update the `SHEET_ID` constant with your actual Google Sheet ID
5. Save the project with a name like "Booth Tracker Webhook"

### Step 3: Deploy Google Apps Script

1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set "Execute as" to "Me"
4. Set "Who has access" to "Anyone"
5. Click "Deploy"
6. Copy the **Web app URL** (you'll need this for Supabase)

### Step 4: Get Webhook URL

1. In your Google Apps Script, run the `getWebhookUrl()` function
2. Copy the URL from the console output
3. This is your webhook URL for Supabase

### Step 5: Deploy Supabase Edge Function

1. Navigate to your Supabase project directory:
   ```bash
   cd api/supabase
   ```

2. Deploy the new Edge Function:
   ```bash
   supabase functions deploy writeToGoogleSheet
   ```

3. Set the environment variable in Supabase:
   ```bash
   supabase secrets set GOOGLE_APPS_SCRIPT_WEBHOOK_URL="YOUR_WEBHOOK_URL"
   ```

### Step 6: Test the Integration

1. **Test Google Apps Script**:
   - Run the `setupSheet()` function to set up headers
   - Run the `testWriteToSheet()` function to test data writing

2. **Test Complete Flow**:
   - Register a new user in your app
   - Complete all booths
   - Check if data appears in your Google Sheet

## 📊 Google Sheet Structure

The Google Sheet will have these columns:

| Column | Description |
|--------|-------------|
| Timestamp | When the completion was recorded |
| Email | User's email address |
| First Name | User's first name |
| Last Name | User's last name |
| Badge Number | User's badge number |
| Registration Date | When user registered |
| Completion Date | When user completed all booths |
| Booths Visited | Number of booths visited |
| Total Booths | Total number of booths |
| Completion Percentage | Percentage completed (100%) |
| Visit History | JSON string with detailed visit history |

## 🔧 Configuration

### Environment Variables

Make sure these are set in your Supabase project:
- `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` - Your Google Apps Script webhook URL

### Frontend Environment Variables

For Vercel deployment, add these to your environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🐛 Troubleshooting

### Common Issues

1. **"Sheet not found" error**:
   - Make sure the sheet name is exactly "User Completions"
   - Check that the Sheet ID is correct

2. **"Webhook URL not configured" error**:
   - Verify the `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` environment variable is set
   - Check that the webhook URL is accessible

3. **"User not found" error**:
   - Verify the user email is correct
   - Check that the user exists in your database

4. **"Failed to write to Google Sheets" error**:
   - Check Google Apps Script logs for errors
   - Verify the Apps Script has proper permissions

### Debugging Steps

1. **Check Supabase Logs**:
   ```bash
   supabase functions logs writeToGoogleSheet
   ```

2. **Check Google Apps Script Logs**:
   - Open your Apps Script project
   - Go to "Executions" tab
   - Check for any error messages

3. **Test Webhook Manually**:
   ```bash
   curl -X POST "YOUR_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

## 🔄 Manual Refresh

If you want to manually refresh the Google Sheet data:

1. **For all users**: Create a new Apps Script function to fetch all completed users from Supabase
2. **For specific user**: Use the existing webhook with a specific user email

## 📈 Analytics

Once set up, you can use the Google Sheet data for:
- **Raffle management** - Export emails of completed users
- **Analytics** - Track completion rates and timing
- **Reporting** - Generate reports for stakeholders
- **Data analysis** - Analyze user behavior patterns

## 🔒 Security Considerations

- The Google Apps Script webhook is publicly accessible
- Consider adding authentication if needed
- The webhook only writes data, it doesn't read sensitive information
- User data is only written when they complete all booths

## 🎉 Success!

Once everything is set up, every time a user completes all booths, their data will automatically appear in your Google Sheet, ready for raffle management and analytics!

## 🎯 Overview

The app integrates with Google Sheets in two ways:
1. **Export user completion data** to Google Sheets when users complete all booths
2. **Import conference sessions** from Google Sheets to update the schedule

## 1. User Completion Data Export

### Setup
1. Create a Google Sheet for user completions
2. Deploy the Google Apps Script (`google-apps-script/Code.gs`)
3. Configure the webhook in Supabase

### Sheet Structure
The user completions sheet should have these columns:
- Timestamp
- Email
- First Name
- Last Name
- Badge Number
- Registration Date
- Completion Date
- Booths Visited
- Total Booths
- Completion Percentage
- Visit History

## 2. Conference Sessions Import

### Setup
1. Create a Google Sheet for conference sessions
2. Use the provided Google Apps Script functions to import data
3. Run the import function to update your sessions table

### Sheet Structure
Create a Google Sheet with the following columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| day | Number | Yes | Conference day (1, 2, 3) |
| start_time | Text | Yes | Start time in HH:MM:SS format |
| topic | Text | Yes | Session title/topic |
| speaker | Text | No | Speaker name |
| description | Text | No | Session description |
| type | Text | No | Session type (keynote, workshop, panel, etc.) |
| location | Text | No | General location |
| room | Text | No | Specific room |
| capacity | Number | No | Maximum capacity |
| is_children_friendly | Boolean | No | true/false for children's sessions |
| requires_registration | Boolean | No | true/false if registration needed |
| tags | Text | No | Comma-separated tags |

### Sample Data
Here's an example of how your sheet should look:

```
day | start_time | topic | speaker | description | type | location | room | capacity | is_children_friendly | requires_registration | tags
1 | 09:00:00 | Opening Ceremony | Conference Chair | Welcome address and overview | opening_ceremony | Main Hall | Grand Ballroom | 300 | false | false | opening,ceremony
1 | 10:30:00 | Coffee Break | | Networking and refreshments | break | Main Hall | Lobby | 200 | false | false | break,networking
1 | 11:00:00 | Keynote: Digital Transformation | Dr. Sarah Johnson | Latest trends in digital transformation | keynote | Main Hall | Grand Ballroom | 300 | false | false | keynote,digital-transformation
2 | 14:00:00 | Children's Festival: Storytelling | Children's Entertainer | Interactive storytelling for kids | performance | Children's Area | Kids Zone | 30 | true | false | children,storytelling,entertainment
```

### Import Process

#### Step 1: Prepare Your Google Sheet
1. Create a new Google Sheet
2. Add the column headers as shown above
3. Fill in your conference session data
4. Note the Sheet ID from the URL (the long string between /d/ and /edit)

#### Step 2: Update the Google Apps Script
1. Open the Google Apps Script editor
2. Update the `testImportSessions()` function with your sheet details:

```javascript
function testImportSessions() {
  const SHEET_ID = 'YOUR_ACTUAL_SHEET_ID'; // Replace with your sheet ID
  const SHEET_NAME = 'Sheet1'; // Replace with your sheet name (usually Sheet1)
  
  try {
    const result = importSessionsFromSheet(SHEET_ID, SHEET_NAME);
    console.log('Import completed successfully:', result);
  } catch (error) {
    console.error('Import failed:', error);
  }
}
```

#### Step 3: Run the Import
1. In the Google Apps Script editor, select the `testImportSessions` function
2. Click the "Run" button
3. Grant necessary permissions when prompted
4. Check the execution log for results

### Import Functions

The Google Apps Script provides these functions:

- `importSessionsFromSheet(sheetId, sheetName)` - Main import function
- `clearSessionsTable()` - Clears all existing sessions before import
- `insertSession(sessionData)` - Inserts a single session
- `parseSessionRow(headers, row)` - Parses sheet data into session format

### Data Validation

The import process validates:
- Required fields (day, start_time, topic)
- Data types (numbers for day/capacity, booleans for flags)
- Tag formatting (comma-separated strings)

### Error Handling

The import provides detailed error reporting:
- Total sessions processed
- Success count
- Error count
- Specific error messages for failed rows

### Tips for Success

1. **Test with a small dataset first** - Import a few sessions to verify the format
2. **Check data types** - Ensure numbers are numbers, booleans are true/false
3. **Validate times** - Use HH:MM:SS format for start times
4. **Handle empty cells** - Leave cells empty rather than filling with placeholder text
5. **Backup existing data** - The import clears existing sessions, so backup if needed

### Troubleshooting

#### Common Issues:
- **"Sheet not found"** - Check the sheet name and ID
- **"Missing required fields"** - Ensure day, start_time, and topic are filled
- **"Invalid data type"** - Check that numbers are numbers and booleans are true/false
- **"Permission denied"** - Ensure the Apps Script has access to your sheet

#### Debug Steps:
1. Check the execution log in Google Apps Script
2. Verify sheet permissions
3. Test with a single row first
4. Validate data format manually

## 3. Manual SQL Import (Alternative)

If you prefer to import data directly via SQL, you can:

1. Export your Google Sheet as CSV
2. Convert the data to SQL INSERT statements
3. Run the SQL in your Supabase dashboard

Example SQL format:
```sql
INSERT INTO sessions (day, start_time, topic, speaker, description, type, location, room, capacity, is_children_friendly, requires_registration, tags) 
VALUES 
(1, '09:00:00', 'Opening Ceremony', 'Conference Chair', 'Welcome address and overview', 'opening_ceremony', 'Main Hall', 'Grand Ballroom', 300, false, false, ARRAY['opening', 'ceremony']),
(1, '10:30:00', 'Coffee Break', NULL, 'Networking and refreshments', 'break', 'Main Hall', 'Lobby', 200, false, false, ARRAY['break', 'networking']);
```

## 4. Automation

For regular updates, you can:
1. Set up a Google Apps Script trigger to run imports automatically
2. Create a webhook endpoint for real-time updates
3. Schedule regular imports using Google Apps Script time-based triggers

This setup provides a flexible way to manage your conference schedule data while maintaining the existing user completion tracking functionality.