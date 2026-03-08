import { Incident, Officer, Assignment, Report } from './types';

export const INITIAL_OFFICERS: Officer[] = [
  { id: '1', name: 'Abebe Bikila', badgeNumber: 'WG-001', rank: 'Captain', email: 'abebe.b@wgpolice.gov.et', station: 'Finote Selam', phone: '0911223344', status: 'Active' },
  { id: '2', name: 'Mulugeta Tesfaye', badgeNumber: 'WG-002', rank: 'Lieutenant', email: 'mulugeta.t@wgpolice.gov.et', station: 'Finote Selam', phone: '0922334455', status: 'Active' },
  { id: '3', name: 'Tadesse Gebre', badgeNumber: 'WG-003', rank: 'Sergeant', email: 'tadesse.g@wgpolice.gov.et', station: 'Finote Selam', phone: '0933445566', status: 'Active' },
];

export const INITIAL_INCIDENTS: Incident[] = [
  { id: '1', title: 'Traffic Accident - Finote Selam', status: 'Open', date: '2024-05-15', location: 'Main Highway', officerId: '1', filingStation: 'Finote Selam Station', recordingOfficerName: 'Abebe Bikila', recordingOfficerRank: 'commander', type: 'Traffic', category: 'vehicleCollision' },
  { id: '2', title: 'Theft Report - Market Area', status: 'In Progress', date: '2024-05-18', location: 'Central Market', officerId: '2', filingStation: 'Bure Station', recordingOfficerName: 'Mulugeta Tesfaye', recordingOfficerRank: 'inspector', type: 'Crime', category: 'burglary' },
  { id: '3', title: 'Public Disturbance', status: 'Closed', date: '2024-05-10', location: 'Stadium Area', officerId: '3', filingStation: 'Dembacha Station', recordingOfficerName: 'Tadesse Gebre', recordingOfficerRank: 'sergeant', type: 'Crime', category: 'other' },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: '1', title: 'Interview Witnesses', description: 'Interview all witnesses at the scene.', status: 'Completed', dueDate: '2024-05-16', incidentId: '1', officerId: '1' },
  { id: '2', title: 'Review CCTV Footage', description: 'Review footage from the market cameras.', status: 'Pending', dueDate: '2024-05-20', incidentId: '2', officerId: '2' },
  { id: '3', title: 'Patrol High-Risk Areas', description: 'Regular patrol in the stadium area.', status: 'Pending', dueDate: '2024-05-22', incidentId: '1', officerId: '3' },
];

export const INITIAL_REPORTS: Report[] = [
  { id: '1', title: 'Monthly Crime Statistics', status: 'Submitted', date: '2024-05-01', location: 'Zone HQ', officerId: '1', filingStation: 'Zone Headquarters', recordingOfficerName: 'Abebe Bikila', recordingOfficerRank: 'commander', type: 'Crime', category: 'other' },
  { id: '2', title: 'Incident 001 Final Report', status: 'Pending Review', date: '2024-05-17', location: 'Bure Market', officerId: '2', filingStation: 'Bure Station', recordingOfficerName: 'Mulugeta Tesfaye', recordingOfficerRank: 'inspector', type: 'Crime', category: 'burglary' },
];

export const EMERGENCY_CONTACTS = [
  { id: '1', nameKey: 'westGojjamZone', phone: '0587750972' },
  { id: '2', nameKey: 'trafficPoliceChief', phone: '0587751102' },
  { id: '3', nameKey: 'finoteSelamCity', phone: '0587751097' },
  { id: '4', nameKey: 'bureCity', phone: '0587741004' },
  { id: '5', nameKey: 'bureZuria', phone: '0587740024' },
  { id: '6', nameKey: 'dembachaCity', phone: '0587730256' },
  { id: '7', nameKey: 'dembachaZuria', phone: '0582311656' },
];
