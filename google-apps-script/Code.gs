/**
 * Google Apps Script to receive webhook data from Supabase
 * and write user completion data to Google Sheets
 * 
 * This script handles booth tracking data only.
 */

// Replace this with your actual Google Sheet ID
const SHEET_ID = '1YZRCCx8icfMjEimmumajNm4yhV2G_8PNGqssZhy0TAE';
const SHEET_NAME = 'User Completions';

/**
 * Webhook endpoint that receives data from Supabase
 * This function will be called when a user completes all booths
 */
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Log the received data for debugging
    console.log('Received webhook data:', JSON.stringify(data, null, 2));
    
    // Write the data to Google Sheets
    const result = writeToSheet(data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data written to sheet', data: result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Write user completion data to Google Sheets
 */
function writeToSheet(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" not found`);
  }
  
  // Prepare the row data
  const rowData = [
    data.timestamp,                           // Timestamp
    data.user.email,                          // Email
    data.user.firstName,                      // First Name
    data.user.lastName,                       // Last Name
    data.user.badgeNumber,                    // Badge Number
    data.user.registrationDate,               // Registration Date
    data.user.completionDate,                 // Completion Date
    data.progress.visitedCount,               // Booths Visited
    data.progress.totalBooths,                // Total Booths
    data.progress.completionPercentage,       // Completion Percentage
    JSON.stringify(data.visitHistory)         // Visit History (JSON)
  ];
  
  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp',
      'Email',
      'First Name',
      'Last Name',
      'Badge Number',
      'Registration Date',
      'Completion Date',
      'Booths Visited',
      'Total Booths',
      'Completion Percentage',
      'Visit History'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  // Append the new row
  sheet.appendRow(rowData);
  
  // Format the new row
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  // Apply some basic formatting
  sheet.getRange(lastRow, 1, 1, lastCol).setBorder(true, true, true, true, true, true);
  
  // Format timestamp columns
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(lastRow, 6).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(lastRow, 7).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  
  // Format percentage column
  sheet.getRange(lastRow, 10).setNumberFormat('0%');
  
  return {
    row: lastRow,
    columns: lastCol,
    message: `Data written to row ${lastRow}`
  };
}

/**
 * Function to get the webhook URL for this Apps Script
 * Run this function to get the URL you need to set in Supabase
 */
function getWebhookUrl() {
  const scriptId = ScriptApp.getScriptId();
  const webhookUrl = `https://script.google.com/macros/s/${scriptId}/exec`;
  console.log('Webhook URL:', webhookUrl);
  return webhookUrl;
}

/**
 * Function to set up the Google Sheet with proper headers
 */
function setupSheet() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" not found. Please create a sheet with this name.`);
  }
  
  const headers = [
    'Timestamp',
    'Email',
    'First Name',
    'Last Name',
    'Badge Number',
    'Registration Date',
    'Completion Date',
    'Booths Visited',
    'Total Booths',
    'Completion Percentage',
    'Visit History'
  ];
  
  // Clear existing data and add headers
  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  console.log('Sheet setup complete!');
}

/**
 * Manual function to test the sheet writing
 * You can run this function manually to test the setup
 */
function testWriteToSheet() {
  const testData = {
    timestamp: new Date().toISOString(),
    user: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      badgeNumber: 'TEST001',
      registrationDate: '2025-01-27T10:00:00Z',
      completionDate: new Date().toISOString()
    },
    progress: {
      visitedCount: 5,
      totalBooths: 5,
      completionPercentage: 100
    },
    visitHistory: [
      {
        boothName: 'Test Booth 1',
        boothPhrase: 'test phrase 1',
        visitedAt: '2025-01-27T10:30:00Z'
      },
      {
        boothName: 'Test Booth 2',
        boothPhrase: 'test phrase 2',
        visitedAt: '2025-01-27T10:35:00Z'
      }
    ]
  };
  
  const result = writeToSheet(testData);
  console.log('Test result:', result);
} 