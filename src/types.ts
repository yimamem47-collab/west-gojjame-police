export type IncidentStatus = 'Open' | 'In Progress' | 'Closed';
export type AssignmentStatus = 'Pending' | 'Completed';
export type ReportStatus = 'Submitted' | 'Pending Review';

export interface Incident {
  id: string;
  title: string;
  status: IncidentStatus;
  date: string;
  location: string;
  officerId: string;
  filingStation: string;
  recordingOfficerName: string;
  recordingOfficerRank: string;
  type: 'Crime' | 'Traffic';
  category: string;
  description?: string;
}

export interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
  rank: string;
  email: string;
  station: string;
  phone: string;
  status: 'Active' | 'On Leave' | 'Suspended';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  status: AssignmentStatus;
  dueDate: string;
  incidentId: string;
  officerId: string;
}

export interface Report {
  id: string;
  title: string;
  status: ReportStatus;
  date: string;
  location: string;
  officerId: string;
  filingStation: string;
  recordingOfficerName: string;
  recordingOfficerRank: string;
  type: 'Crime' | 'Traffic';
  category: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Officer';
  avatar?: string;
}
