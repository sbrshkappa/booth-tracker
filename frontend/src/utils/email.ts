import { User } from './types';

export interface EmailResult {
  success: boolean;
  message: string;
}

export const sendVisitNotesEmail = async (user: User): Promise<EmailResult> => {
  try {
    const response = await fetch('/api/sendVisitNotesEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }
    
    return {
      success: true,
      message: '📧 Email sent successfully! Check your inbox for your booth visit summary.'
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to send email. Please try again.'
    };
  }
}; 