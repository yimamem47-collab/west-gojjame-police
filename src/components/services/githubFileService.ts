export interface SyncResult {
export interface SyncResult {
  file: string;
  status: 'success' | 'error';
  message?: string;
}

export const pushFileToGitHub = async (fileName: string, content: string): Promise<SyncResult> => {
  try {
    const response = await fetch('/api/github/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, content })
    });
    
    if (response.ok) {
      return { file: fileName, status: 'success' };
    }
    return { file: fileName, status: 'error', message: 'Upload failed' };
  } catch (error: any) {
    return { file: fileName, status: 'error', message: error.message };
  }
};
