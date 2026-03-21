import { useState, useEffect } from 'react';
import { Incident, Officer, Assignment, Report, User, ZoneReport } from '../types';
import { INITIAL_OFFICERS, INITIAL_INCIDENTS, INITIAL_ASSIGNMENTS, INITIAL_REPORTS } from '../constants';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { sendTelegramMessage, formatIncidentMessage, formatOfficerMessage, formatAssignmentMessage, escapeHtml } from '../services/telegramService';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where
} from 'firebase/firestore';

export function useAppData() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [zoneReports, setZoneReports] = useState<ZoneReport[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Sync with Firestore
  useEffect(() => {
    if (!user) {
      setOfficers([]);
      setIncidents([]);
      setAssignments([]);
      setReports([]);
      setZoneReports([]);
      return;
    }

    const isAdmin = user.role === 'Admin';

    // Officers query
    const officersQuery = isAdmin 
      ? collection(db, 'officers') 
      : query(collection(db, 'officers'), where('email', '==', user.email));

    const unsubOfficers = onSnapshot(officersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Officer);
      let finalOfficers = data;
      if (data.length === 0 && isAdmin) {
        finalOfficers = INITIAL_OFFICERS;
      } else if (data.length === 0 && !isAdmin && user) {
        finalOfficers = [{
          id: user.id,
          name: user.name,
          email: user.email,
          rank: 'constable',
          badgeNumber: 'PENDING',
          station: 'Pending Assignment',
          phone: '',
          status: 'Active'
        }];
      }
      setOfficers(finalOfficers);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'officers');
    });

    // Incidents query
    const incidentsQuery = isAdmin 
      ? collection(db, 'incidents') 
      : query(collection(db, 'incidents'), where('officerId', '==', user.id));

    const unsubIncidents = onSnapshot(incidentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Incident);
      setIncidents(data.length > 0 ? data : (isAdmin ? INITIAL_INCIDENTS : []));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'incidents');
    });

    // Assignments query
    const assignmentsQuery = isAdmin 
      ? collection(db, 'assignments') 
      : query(collection(db, 'assignments'), where('officerId', '==', user.id));

    const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Assignment);
      setAssignments(data.length > 0 ? data : (isAdmin ? INITIAL_ASSIGNMENTS : []));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'assignments');
    });

    // Reports query
    const reportsQuery = isAdmin 
      ? collection(db, 'reports') 
      : query(collection(db, 'reports'), where('officerId', '==', user.id));

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Report);
      setReports(data.length > 0 ? data : (isAdmin ? INITIAL_REPORTS : []));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'reports');
    });

    // Zone Reports query
    const zoneReportsQuery = isAdmin 
      ? collection(db, 'zone_detailed_reports') 
      : query(collection(db, 'zone_detailed_reports'), where('officer_id', '==', user.id));

    const unsubZoneReports = onSnapshot(zoneReportsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as ZoneReport);
      setZoneReports(data);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'zone_detailed_reports');
    });

    return () => {
      unsubOfficers();
      unsubIncidents();
      unsubAssignments();
      unsubReports();
      unsubZoneReports();
    };
  }, [user]);

  const addOfficer = async (officer: Omit<Officer, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newOfficer = { ...officer, id };
    try {
      await setDoc(doc(db, 'officers', id), newOfficer);
      await sendTelegramMessage(formatOfficerMessage(newOfficer));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `officers/${id}`);
    }
  };

  const updateOfficer = async (id: string, updates: Partial<Officer>) => {
    try {
      await updateDoc(doc(db, 'officers', id), updates);
      const updatedOfficer = officers.find(o => o.id === id);
      if (updatedOfficer) {
        await sendTelegramMessage(formatOfficerMessage({ ...updatedOfficer, ...updates }, true));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `officers/${id}`);
    }
  };

  const deleteOfficer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'officers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `officers/${id}`);
    }
  };

  const addIncident = async (incident: Omit<Incident, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const officerId = incident.officerId || user?.id || '';
    const officer = officers.find(o => o.id === officerId);
    const enrichedIncident = {
      ...incident,
      id,
      officerId,
      recordingOfficerName: officer?.name || incident.recordingOfficerName || 'Unknown',
      recordingOfficerRank: officer?.rank || incident.recordingOfficerRank || 'constable'
    };
    try {
      await setDoc(doc(db, 'incidents', id), enrichedIncident);
      await sendTelegramMessage(formatIncidentMessage(enrichedIncident, 'Incident'));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `incidents/${id}`);
    }
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    try {
      let finalUpdates = { ...updates };
      if (updates.officerId) {
        const officer = officers.find(o => o.id === updates.officerId);
        if (officer) {
          finalUpdates.recordingOfficerName = officer.name;
          finalUpdates.recordingOfficerRank = officer.rank;
        }
      }
      await updateDoc(doc(db, 'incidents', id), finalUpdates);
      const updatedIncident = incidents.find(i => i.id === id);
      if (updatedIncident) {
        await sendTelegramMessage(formatIncidentMessage({ ...updatedIncident, ...finalUpdates }, 'Incident', true));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `incidents/${id}`);
    }
  };

  const deleteIncident = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'incidents', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `incidents/${id}`);
    }
  };

  const addAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const officerId = user?.id || assignment.officerId || '';
    const newAssignment = { ...assignment, id, officerId };
    try {
      await setDoc(doc(db, 'assignments', id), newAssignment);
      await sendTelegramMessage(formatAssignmentMessage(newAssignment));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `assignments/${id}`);
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    try {
      await updateDoc(doc(db, 'assignments', id), updates);
      const updatedAssignment = assignments.find(a => a.id === id);
      if (updatedAssignment) {
        await sendTelegramMessage(formatAssignmentMessage({ ...updatedAssignment, ...updates }, true));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `assignments/${id}`);
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'assignments', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `assignments/${id}`);
    }
  };

  const addReport = async (report: Omit<Report, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const officerId = report.officerId || user?.id || '';
    const officer = officers.find(o => o.id === officerId);
    const enrichedReport = {
      ...report,
      id,
      officerId,
      recordingOfficerName: officer?.name || report.recordingOfficerName || 'Unknown',
      recordingOfficerRank: officer?.rank || report.recordingOfficerRank || 'constable'
    };
    try {
      await setDoc(doc(db, 'reports', id), enrichedReport);
      await sendTelegramMessage(formatIncidentMessage(enrichedReport, 'Report'));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `reports/${id}`);
    }
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    try {
      let finalUpdates = { ...updates };
      if (updates.officerId) {
        const officer = officers.find(o => o.id === updates.officerId);
        if (officer) {
          finalUpdates.recordingOfficerName = officer.name;
          finalUpdates.recordingOfficerRank = officer.rank;
        }
      }
      await updateDoc(doc(db, 'reports', id), finalUpdates);
      const updatedReport = reports.find(r => r.id === id);
      if (updatedReport) {
        await sendTelegramMessage(formatIncidentMessage({ ...updatedReport, ...finalUpdates }, 'Report', true));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${id}`);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reports/${id}`);
    }
  };

  const addZoneReport = async (report: Omit<ZoneReport, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newReport = { 
      ...report, 
      id, 
      timestamp: new Date().toISOString() 
    };
    try {
      await setDoc(doc(db, 'zone_detailed_reports', id), newReport);
      await sendTelegramMessage(`📋 <b>New Zone Detailed Report</b>\n---------------------------\n<b>Officer:</b> ${escapeHtml(newReport.officer_name)}\n<b>Deputy Dept:</b> ${escapeHtml(newReport.deputy_dept)}\n<b>Main Dept:</b> ${escapeHtml(newReport.main_dept)}\n<b>Wereda:</b> ${escapeHtml(newReport.wereda)}\n<b>Type:</b> ${escapeHtml(newReport.report_type)}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `zone_detailed_reports/${id}`);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return {
    officers, incidents, assignments, reports, zoneReports, user,
    addOfficer, updateOfficer, deleteOfficer,
    addIncident, updateIncident, deleteIncident,
    addAssignment, updateAssignment, deleteAssignment,
    addReport, updateReport, deleteReport,
    addZoneReport,
    login, logout, setUser
  };
}
