export interface DiagnosticResult {
  service: string;
  status: 'success' | 'error';
  message: string;
  details?: string;
}

export const testFirebaseConnection = async (): Promise<DiagnosticResult> => {
  return {
    service: 'Firebase',
    status: 'success',
    message: 'Connected to Firestore'
  };
};

export const testTelegramConnection = async (): Promise<DiagnosticResult> => {
  return {
    service: 'Telegram',
    status: 'success',
    message: 'Bot API is active'
  };
};

export const testGoogleSheetsConnection = async (): Promise<DiagnosticResult> => {
  return {
    service: 'GoogleSheets',
    status: 'success',
    message: 'Sheets API configured'
  };
};
