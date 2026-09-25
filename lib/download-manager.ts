import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Platform } from 'react-native';
import { updateNoteLocalUri } from './db';

const NOTES_DIR = `${FileSystem.documentDirectory}notes/`;

// Ensure notes directory exists
export async function ensureNotesDirectory(): Promise<string> {
  const dirInfo = await FileSystem.getInfoAsync(NOTES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(NOTES_DIR, { intermediates: true });
  }
  return NOTES_DIR;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function getLocalPathForNote(noteId: number, originalFileName: string): string {
  const clean = sanitizeFileName(originalFileName);
  return `${NOTES_DIR}${noteId}_${clean}`;
}

export async function isNoteDownloaded(noteId: number, fileName: string): Promise<boolean> {
  const path = getLocalPathForNote(noteId, fileName);
  const info = await FileSystem.getInfoAsync(path);
  return info.exists;
}

export async function downloadNoteFile(
  noteId: number,
  url: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<string | null> {
  try {
    await ensureNotesDirectory();
    const localUri = getLocalPathForNote(noteId, fileName);

    // If already exists, return immediately
    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists) {
      updateNoteLocalUri(noteId, localUri);
      return localUri;
    }

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      localUri,
      {},
      (progress) => {
        if (progress.totalBytesExpectedToWrite > 0 && onProgress) {
          const ratio = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
          onProgress(ratio);
        }
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (result && result.uri) {
      updateNoteLocalUri(noteId, result.uri);
      return result.uri;
    }
    return null;
  } catch (error) {
    console.error('Error downloading note:', error);
    Alert.alert('Download Failed', 'Could not download note. Please check your internet connection.');
    return null;
  }
}

export async function deleteLocalNote(noteId: number, fileName: string): Promise<boolean> {
  try {
    const localUri = getLocalPathForNote(noteId, fileName);
    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }
    updateNoteLocalUri(noteId, null);
    return true;
  } catch (e) {
    console.warn('Failed to delete note:', e);
    return false;
  }
}

export async function getStorageUsage(): Promise<{ totalBytes: number; fileCount: number }> {
  try {
    await ensureNotesDirectory();
    const files = await FileSystem.readDirectoryAsync(NOTES_DIR);
    let totalBytes = 0;
    for (const f of files) {
      const info = await FileSystem.getInfoAsync(`${NOTES_DIR}${f}`);
      if (info.exists && typeof info.size === 'number') {
        totalBytes += info.size;
      }
    }
    return { totalBytes, fileCount: files.length };
  } catch (e) {
    return { totalBytes: 0, fileCount: 0 };
  }
}

export async function clearAllLocalNotes(): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(NOTES_DIR);
    if (info.exists) {
      await FileSystem.deleteAsync(NOTES_DIR, { idempotent: true });
      await ensureNotesDirectory();
    }
    return true;
  } catch (e) {
    console.warn('Failed to clear notes directory:', e);
    return false;
  }
}

export function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'zip':
      return 'application/zip';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

export async function openNoteInExternalViewer(localUri: string, fileName: string): Promise<void> {
  try {
    if (Platform.OS !== 'android') {
      Alert.alert('Unsupported Platform', 'Native document launching is supported on Android devices.');
      return;
    }

    const contentUri = await FileSystem.getContentUriAsync(localUri);
    const mimeType = getMimeType(fileName);

    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
      type: mimeType,
    });
  } catch (error) {
    console.error('Failed to open document with intent:', error);
    Alert.alert(
      'No Viewer App Found',
      'Please install a PDF or document viewer app from Google Play Store to open this file.'
    );
  }
}
