// src/services/githubFileService.ts

export const syncToGitHub = async (files: string[]) => {
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files }),
    });

    if (!response.ok) {
      throw new Error('GitHub Sync failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing to GitHub:', error);
    throw error;
  }
};
