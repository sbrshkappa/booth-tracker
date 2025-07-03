// Email template for visit notes summary
export const EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
      background-color: #f8f9fa;
    }
    .header { 
      background: linear-gradient(135deg, #fba758 0%, #ff8c42 100%); 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
      border-radius: 16px 16px 0 0; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .logo {
      width: 120px;
      height: auto;
      margin-bottom: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content { 
      background: white; 
      padding: 30px; 
      border-radius: 0 0 16px 16px; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .welcome-section {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 12px;
      border: 1px solid #f59e0b;
    }
    .welcome-section h2 {
      color: #92400e;
      margin: 0 0 10px 0;
      font-size: 22px;
      font-weight: 600;
    }
    .welcome-section p {
      color: #78350f;
      margin: 0;
      font-size: 16px;
    }
    .highlight-box {
      background: linear-gradient(135deg, #fba758 0%, #ff8c42 100%); 
      color: white;
      padding: 24px; 
      border-radius: 12px; 
      margin: 20px 0; 
      text-align: center; 
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .highlight-box h3 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
    }
    .highlight-box p {
      margin: 8px 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .section-header {
      color: #374151;
      font-size: 20px;
      font-weight: 600;
      margin: 30px 0 20px 0;
      text-align: center;
      padding-bottom: 8px;
      border-bottom: 2px solid #fba758;
    }
    .memory-card { 
      background: white; 
      padding: 20px; 
      margin: 16px 0; 
      border-radius: 12px; 
      border-left: 4px solid #fba758; 
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .memory-title { 
      font-weight: 600; 
      color: #fba758; 
      font-size: 18px; 
      margin-bottom: 12px; 
    }
    .memory-date { 
      color: #6b7280; 
      font-size: 14px; 
      margin-bottom: 12px; 
    }
    .memory-details { 
      color: #6b7280; 
      font-size: 14px; 
      margin-bottom: 12px; 
    }
    .memory-content { 
      background: #fef3c7; 
      padding: 16px; 
      border-radius: 8px; 
      margin-top: 12px; 
      border: 1px solid #fde68a;
    }
    .rating { 
      color: #f59e0b; 
      font-weight: 600; 
      margin: 8px 0;
    }
    .empty-state { 
      text-align: center; 
      padding: 40px; 
      color: #6b7280; 
      background: #f9fafb;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }
    .empty-state h3 {
      color: #fba758;
      margin-bottom: 12px;
    }
    .thank-you-section {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      padding: 30px;
      border-radius: 12px;
      margin: 30px 0;
      text-align: center;
      border: 1px solid #f59e0b;
    }
    .thank-you-section h3 {
      color: #92400e;
      margin: 0 0 15px 0;
      font-size: 20px;
      font-weight: 600;
    }
    .thank-you-section p {
      color: #78350f;
      margin: 0;
      font-size: 16px;
      line-height: 1.6;
    }
    .footer { 
      text-align: center; 
      margin-top: 30px; 
      color: #6b7280; 
      font-size: 14px; 
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://booth-tracker.vercel.app/assets/conference-companion.png" alt="SSSIO Conference Companion" class="logo">
    <h1>🌟 Your SSSIO Conference Journey</h1>
    <p>Dear {{userName}}, here's a beautiful summary of your spiritual experience!</p>
  </div>
  
  <div class="content">
    <div class="welcome-section">
      <h2>🙏 Welcome to Your Conference Memories</h2>
      <p>Thank you for being part of this incredible spiritual gathering. Your presence and participation have made this conference truly special!</p>
    </div>

    <div class="highlight-box">
      <h3>✨ Your Conference Highlights</h3>
      <p><strong>Booths Explored:</strong> {{totalVisits}} amazing experiences</p>
      <p><strong>Memories Captured:</strong> {{totalNotes}} precious notes</p>
      <p><strong>Sessions Attended:</strong> {{totalSessions}} inspiring moments</p>
      <p><strong>Insights Recorded:</strong> {{totalSessionNotes}} valuable reflections</p>
    </div>

    {{#if hasBoothNotes}}
    <div class="section-header">🏠 Your Exhibition Memories</div>
    {{#each visitsWithNotes}}
    <div class="memory-card">
      <div class="memory-title">🏢 {{boothName}}</div>
      <div class="memory-date">📅 {{visitDate}}</div>
      {{#if rating}}<div class="rating">⭐ {{rating}}/5 stars</div>{{/if}}
      <div class="memory-content">
        <strong>Your Reflections:</strong><br>
        {{notes}}
      </div>
    </div>
    {{/each}}
    {{else}}
    <div class="empty-state">
      <h3>🏠 Ready for Your First Memory</h3>
      <p>Your exhibition journey is just beginning! Visit booths and capture your thoughts to create lasting memories.</p>
    </div>
    {{/if}}

    {{#if hasSessionNotes}}
    <div class="section-header">📅 Your Session Insights</div>
    {{#each sessionsWithNotes}}
    <div class="memory-card">
      <div class="memory-title">📅 {{sessionTitle}}</div>
      <div class="memory-details">
        {{#if speaker}}<strong>Speaker:</strong> {{speaker}}<br>{{/if}}
        {{#if time}}<strong>Time:</strong> {{time}}<br>{{/if}}
        {{#if day}}<strong>Day:</strong> {{day}}<br>{{/if}}
      </div>
      {{#if rating}}<div class="rating">⭐ {{rating}}/5 stars</div>{{/if}}
      <div class="memory-content">
        <strong>Your Insights:</strong><br>
        {{notes}}
      </div>
    </div>
    {{/each}}
    {{else}}
    <div class="empty-state">
      <h3>📅 Your Wisdom Awaits</h3>
      <p>Attend sessions and capture the wisdom shared. Every insight is a step on your spiritual journey.</p>
    </div>
    {{/if}}

    <div class="thank-you-section">
      <h3>🙏 Thank You for Your Beautiful Presence</h3>
      <p>{{thankYouMessage}}</p>
    </div>

    <div class="footer">
      <p>With gratitude and love,<br>The SSSIO USA Team</p>
      <p>This email was created with love from your conference data.</p>
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
    <div class="memory-card">
      <div class="memory-title">🏢 ${booth.name}</div>
      <div class="memory-date">📅 ${visitDate}</div>
      ${visit.rating ? `<div class="rating">⭐ ${visit.rating}/5 stars</div>` : ''}
      <div class="memory-content">
        <strong>Your Reflections:</strong><br>
        ${visit.notes}
      </div>
    </div>
  `
}

// Helper function to generate session card HTML
export function generateSessionCard(sessionNote: any): string {
  const session = sessionNote.sessions
  const sessionDate = new Date(sessionNote.updated_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return `
    <div class="memory-card">
      <div class="memory-title">📅 ${session.topic}</div>
      <div class="memory-details">
        ${session.speaker ? `<strong>Speaker:</strong> ${session.speaker}<br>` : ''}
        ${session.start_time ? `<strong>Time:</strong> ${session.start_time}<br>` : ''}
        ${session.day ? `<strong>Day:</strong> ${session.day}<br>` : ''}
      </div>
      ${sessionNote.rating ? `<div class="rating">⭐ ${sessionNote.rating}/5 stars</div>` : ''}
      <div class="memory-content">
        <strong>Your Insights:</strong><br>
        ${sessionNote.notes}
      </div>
    </div>
  `
}

// Helper function to generate no notes message
export function generateNoNotesMessage(): string {
  return `
    <div class="empty-state">
      <h3>📝 Your Journey Begins Here</h3>
      <p>Start capturing your thoughts and insights to create beautiful memories of your conference experience!</p>
    </div>
  `
} 