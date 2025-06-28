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