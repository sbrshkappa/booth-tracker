// Email template for visit notes summary
export const EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 30px; 
      text-align: center; 
      border-radius: 10px 10px 0 0; 
    }
    .content { 
      background: #f9f9f9; 
      padding: 30px; 
      border-radius: 0 0 10px 10px; 
    }
    .stats { 
      background: white; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0; 
      text-align: center; 
    }
    .visit-card { 
      background: white; 
      padding: 20px; 
      margin: 15px 0; 
      border-radius: 8px; 
      border-left: 4px solid #667eea; 
    }
    .booth-name { 
      font-weight: bold; 
      color: #667eea; 
      font-size: 18px; 
      margin-bottom: 10px; 
    }
    .visit-date { 
      color: #666; 
      font-size: 14px; 
      margin-bottom: 10px; 
    }
    .notes { 
      background: #f0f8ff; 
      padding: 15px; 
      border-radius: 5px; 
      margin-top: 10px; 
    }
    .rating { 
      color: #ffa500; 
      font-weight: bold; 
    }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      color: #666; 
      font-size: 14px; 
    }
    .no-notes { 
      text-align: center; 
      padding: 40px; 
      color: #666; 
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎪 SSSIO USA 2025 Booth Visit Summary</h1>
    <p>Hello {{userName}}, here's a summary of your booth visits!</p>
  </div>
  
  <div class="content">
    <div class="stats">
      <h2>📊 Your Visit Statistics</h2>
      <p><strong>Total Booths Visited:</strong> {{totalVisits}}</p>
      <p><strong>Booths with Notes:</strong> {{totalNotes}}</p>
      <p><strong>Completion Rate:</strong> {{completionRate}}%</p>
    </div>

    {{#if hasNotes}}
    <h2>📝 Your Visit Notes</h2>
    {{#each visitsWithNotes}}
    <div class="visit-card">
      <div class="booth-name">🏢 {{boothName}}</div>
      <div class="visit-date">📅 Visited on {{visitDate}}</div>
      {{#if rating}}<div class="rating">⭐ Rating: {{rating}}/5</div>{{/if}}
      <div class="notes">
        <strong>Your Notes:</strong><br>
        {{notes}}
      </div>
    </div>
    {{/each}}
    {{else}}
    <div class="no-notes">
      <h3>📝 No Notes Yet</h3>
      <p>You haven't taken any notes during your booth visits yet. Consider adding notes next time to keep track of important information!</p>
    </div>
    {{/if}}

    <div class="footer">
      <p>Thank you for participating in SSSIO USA 2025!</p>
      <p>This email was generated automatically from your booth visit data.</p>
    </div>
  </div>
</body>
</html>`

// Helper function to generate visit card HTML
export function generateVisitCard(visit: any): string {
  const booth = visit.booths
  const visitDate = new Date(visit.visited_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  return `
    <div class="visit-card">
      <div class="booth-name">🏢 ${booth.name}</div>
      <div class="visit-date">📅 Visited on ${visitDate}</div>
      ${visit.rating ? `<div class="rating">⭐ Rating: ${visit.rating}/5</div>` : ''}
      <div class="notes">
        <strong>Your Notes:</strong><br>
        ${visit.notes}
      </div>
    </div>
  `
}

// Helper function to generate no notes message
export function generateNoNotesMessage(): string {
  return `
    <div class="no-notes">
      <h3>📝 No Notes Yet</h3>
      <p>You haven't taken any notes during your booth visits yet. Consider adding notes next time to keep track of important information!</p>
    </div>
  `
} 