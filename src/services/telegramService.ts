const BOT_TOKEN = '8405421128:AAEX7lRd1Q0unboIvb1FIthAIH0QCR7iJXA';
const CHAT_ID = '-1003878859973';

export async function sendTelegramMessage(message: string) {
  console.log('Attempting to send Telegram message to:', CHAT_ID);
  console.log('Message content:', message);
  
  // Use GET request for simpler cross-origin compatibility in some environments
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}&parse_mode=HTML`;
  
  try {
    console.log('Sending GET request to Telegram...');
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error (GET):', errorData);
      
      // If GET fails, try POST
      console.log('GET failed, attempting POST fallback...');
      const postUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const postResponse = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });
      
      if (!postResponse.ok) {
        const postErrorData = await postResponse.json();
        console.error('Telegram API error (POST):', postErrorData);
        return false;
      }
      
      console.log('Telegram message sent successfully via POST');
      return true;
    }
    
    console.log('Telegram message sent successfully via GET');
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}

export function formatIncidentMessage(incident: any, type: 'Incident' | 'Report', isUpdate: boolean = false) {
  const emoji = incident.type === 'Crime' ? '🚨' : '🚗';
  const action = isUpdate ? 'Updated' : 'New';
  const header = type === 'Incident' ? `<b>${action} Incident Reported</b>` : `<b>${action} Case Report Submitted</b>`;
  
  return `
${emoji} ${header}
---------------------------
<b>Title:</b> ${incident.title}
<b>Status:</b> ${incident.status}
<b>Type:</b> ${incident.type}
<b>Category:</b> ${incident.category}
<b>Location:</b> ${incident.location}
<b>Date:</b> ${incident.date}
<b>Station:</b> ${incident.filingStation}
<b>Officer:</b> ${incident.recordingOfficerRank || ''} ${incident.recordingOfficerName || ''}
---------------------------
<b>Description:</b>
${incident.description || 'No description provided'}
  `.trim();
}

export function formatOfficerMessage(officer: any, isUpdate: boolean = false) {
  const action = isUpdate ? 'Updated' : 'New';
  return `
👮 <b>${action} Officer Profile</b>
---------------------------
<b>Name:</b> ${officer.name}
<b>Rank:</b> ${officer.rank}
<b>Badge #:</b> ${officer.badgeNumber}
<b>Station:</b> ${officer.station}
<b>Phone:</b> ${officer.phone}
<b>Email:</b> ${officer.email}
<b>Status:</b> ${officer.status}
  `.trim();
}

export function formatAssignmentMessage(assignment: any, isUpdate: boolean = false) {
  const action = isUpdate ? 'Updated' : 'New';
  return `
📋 <b>${action} Duty Assignment</b>
---------------------------
<b>Title:</b> ${assignment.title}
<b>Type:</b> ${assignment.type}
<b>Priority:</b> ${assignment.priority}
<b>Status:</b> ${assignment.status}
<b>Location:</b> ${assignment.location}
<b>Officer ID:</b> ${assignment.officerId}
<b>Due Date:</b> ${assignment.dueDate}
  `.trim();
}
