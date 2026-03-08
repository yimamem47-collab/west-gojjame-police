import { useState, useEffect } from 'react';
import { Incident, Officer, Assignment, Report, User } from '../types';
import { INITIAL_OFFICERS, INITIAL_INCIDENTS, INITIAL_ASSIGNMENTS, INITIAL_REPORTS } from '../constants';
import { db } from '../firebase';
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

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: 'Auth info handled in App.tsx',
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useAppData() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Sync with Firestore
  useEffect(() => {
    if (!user) {
      setOfficers([]);
      setIncidents([]);
      setAssignments([]);
      setReports([]);
      return;
    }

    const isAdmin = user.role === 'Admin';

    // Officers query: Admins see all, others see only themselves by email
    const officersQuery = isAdmin 
      ? collection(db, 'officers') 
      : query(collection(db, 'officers'), where('email', '==', user.email));

    const unsubOfficers = onSnapshot(officersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Officer);
      setOfficers(data.length > 0 ? data : (isAdmin ? INITIAL_OFFICERS : []));
    }, (err) => {
      if (err.code !== 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, 'officers');
      }
    });

    // Incidents query: Admins see all, others see only their own
    const incidentsQuery = isAdmin 
      ? collection(db, 'incidents') 
      : query(collection(db, 'incidents'), where('officerId', '==', user.id));

    const unsubIncidents = onSnapshot(incidentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Incident);
      setIncidents(data.length > 0 ? data : (isAdmin ? INITIAL_INCIDENTS : []));
    }, (err) => {
      if (err.code !== 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, 'incidents');
      }
    });

    // Assignments query: Admins see all, others see only their own
    const assignmentsQuery = isAdmin 
      ? collection(db, 'assignments') 
      : query(collection(db, 'assignments'), where('officerId', '==', user.id));

    const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Assignment);
      setAssignments(data.length > 0 ? data : (isAdmin ? INITIAL_ASSIGNMENTS : []));
    }, (err) => {
      if (err.code !== 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, 'assignments');
      }
    });

    // Reports query: Admins see all, others see only their own
    const reportsQuery = isAdmin 
      ? collection(db, 'reports') 
      : query(collection(db, 'reports'), where('officerId', '==', user.id));

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Report);
      setReports(data.length > 0 ? data : (isAdmin ? INITIAL_REPORTS : []));
    }, (err) => {
      if (err.code !== 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, 'reports');
      }
    });

    return () => {
      unsubOfficers();
      unsubIncidents();
      unsubAssignments();
      unsubReports();
    };
  }, [user]);

  const addOfficer = async (officer: Omit<Officer, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const path = `officers/${id}`;
    try {
      await setDoc(doc(db, 'officers', id), { ...officer, id });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateOfficer = async (id: string, updates: Partial<Officer>) => {
    const path = `officers/${id}`;
    try {
      await updateDoc(doc(db, 'officers', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteOfficer = async (id: string) => {
    const path = `officers/${id}`;
    try {
      await deleteDoc(doc(db, 'officers', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addIncident = async (incident: Omit<Incident, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const path = `incidents/${id}`;
    const officerId = user?.id || incident.officerId || '';
    try {
      await setDoc(doc(db, 'incidents', id), { ...incident, id, officerId });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateIncident = async (id: string, updates: Partial<Incident>) => {
    const path = `incidents/${id}`;
    try {
      await updateDoc(doc(db, 'incidents', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteIncident = async (id: string) => {
    const path = `incidents/${id}`;
    try {
      await deleteDoc(doc(db, 'incidents', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const path = `assignments/${id}`;
    const officerId = user?.id || assignment.officerId || '';
    try {
      await setDoc(doc(db, 'assignments', id), { ...assignment, id, officerId });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    const path = `assignments/${id}`;
    try {
      await updateDoc(doc(db, 'assignments', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteAssignment = async (id: string) => {
    const path = `assignments/${id}`;
    try {
      await deleteDoc(doc(db, 'assignments', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const addReport = async (report: Omit<Report, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const path = `reports/${id}`;
    const officerId = user?.id || report.officerId || '';
    try {
      await setDoc(doc(db, 'reports', id), { ...report, id, officerId });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    const path = `reports/${id}`;
    try {
      await updateDoc(doc(db, 'reports', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteReport = async (id: string) => {
    const path = `reports/${id}`;
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return {
    officers, incidents, assignments, reports, user,
    addOfficer, updateOfficer, deleteOfficer,
    addIncident, updateIncident, deleteIncident,
    addAssignment, updateAssignment, deleteAssignment,
    addReport, updateReport, deleteReport,
    login, logout, setUser
  };
}
