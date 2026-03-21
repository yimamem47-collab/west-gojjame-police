const BOT_TOKEN = '8405421128:AAEX7lRd1Q0unboIvb1FIthAIH0QCR7iJXA';
const CHAT_ID = '-1003878859973';

export async function sendTelegramMessage(message: string) {
  console.log('Attempting to send Telegram message to:', CHAT_ID);
  
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  try {
    console.log('Sending POST request to Telegram...');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error (POST):', errorData);
      
      // Fallback: try sending without HTML parsing if it failed due to bad entities
      if (errorData.description && errorData.description.includes('parse entities')) {
        console.log('Retrying without HTML parse mode...');
        const fallbackResponse = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message.replace(/<[^>]*>?/gm, '') // Strip HTML tags for fallback
          })
        });
        if (fallbackResponse.ok) return true;
      }
      
      return false;
    }
    
    console.log('Telegram message sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

export function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatIncidentMessage(incident: any, type: 'Incident' | 'Report', isUpdate: boolean = false) {
  const emoji = incident.type === 'Crime' ? '🚨' : '🚗';
  const action = isUpdate ? 'Updated' : 'New';
  
  // If it's a citizen report, use the user's requested format
  if (incident.officerId === 'citizen') {
    return `🚨 አዲስ የፖሊስ ጥቆማ፦\n\n<b>Title:</b> ${escapeHtml(incident.title)}\n<b>Type:</b> ${escapeHtml(incident.type)}\n<b>Category:</b> ${escapeHtml(incident.category)}\n<b>Location:</b> ${escapeHtml(incident.location)}\n<b>Description:</b>\n${escapeHtml(incident.description || 'No description provided')}`;
  }

  const header = type === 'Incident' ? `<b>${action} Incident Reported</b>` : `<b>${action} Case Report Submitted</b>`;
  
  return `
${emoji} ${header}
---------------------------
<b>Title:</b> ${escapeHtml(incident.title)}
<b>Status:</b> ${escapeHtml(incident.status)}
<b>Type:</b> ${escapeHtml(incident.type)}
<b>Category:</b> ${escapeHtml(incident.category)}
<b>Location:</b> ${escapeHtml(incident.location)}
<b>Date:</b> ${escapeHtml(incident.date)}
<b>Station:</b> ${escapeHtml(incident.filingStation)}
<b>Officer:</b> ${escapeHtml(incident.recordingOfficerRank || '')} ${escapeHtml(incident.recordingOfficerName || '')}
---------------------------
<b>Description:</b>
${escapeHtml(incident.description || 'No description provided')}
  `.trim();
}

export function formatOfficerMessage(officer: any, isUpdate: boolean = false) {
  const action = isUpdate ? 'Updated' : 'New';
  return `
👮 <b>${action} Officer Profile</b>
---------------------------
<b>Name:</b> ${escapeHtml(officer.name)}
<b>Rank:</b> ${escapeHtml(officer.rank)}
<b>Badge #:</b> ${escapeHtml(officer.badgeNumber)}
<b>Station:</b> ${escapeHtml(officer.station)}
<b>Phone:</b> ${escapeHtml(officer.phone)}
<b>Email:</b> ${escapeHtml(officer.email)}
<b>Status:</b> ${escapeHtml(officer.status)}
  `.trim();
}

export function formatAssignmentMessage(assignment: any, isUpdate: boolean = false) {
  const action = isUpdate ? 'Updated' : 'New';
  return `
📋 <b>${action} Duty Assignment</b>
---------------------------
<b>Title:</b> ${escapeHtml(assignment.title)}
<b>Type:</b> ${escapeHtml(assignment.type)}
<b>Priority:</b> ${escapeHtml(assignment.priority)}
<b>Status:</b> ${escapeHtml(assignment.status)}
<b>Location:</b> ${escapeHtml(assignment.location)}
<b>Officer ID:</b> ${escapeHtml(assignment.officerId)}
<b>Due Date:</b> ${escapeHtml(assignment.dueDate)}
  `.trim();
}
