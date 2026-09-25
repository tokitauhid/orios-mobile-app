import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Download, ExternalLink, Check, Trash2, FileText } from 'lucide-react-native';
import { Note, Subject } from '../lib/types';
import { SubjectBadge } from './SubjectBadge';
import {
  downloadNoteFile,
  openNoteInExternalViewer,
  deleteLocalNote,
} from '../lib/download-manager';

interface NoteItemCardProps {
  note: Note;
  subject?: Subject;
  onStatusChanged?: () => void;
}

export const NoteItemCard: React.FC<NoteItemCardProps> = ({
  note,
  subject,
  onStatusChanged,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const attachment = (note.attachments && note.attachments[0]) || {
    name: `${note.title}.${note.type || 'pdf'}`,
    url: note.url,
    type: note.type || 'pdf',
  };

  const handleDownload = async () => {
    if (!attachment.url) {
      Alert.alert('Error', 'Attachment URL is missing.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    const localUri = await downloadNoteFile(
      note.id,
      attachment.url,
      attachment.name,
      (progress) => {
        setDownloadProgress(progress);
      }
    );

    setIsDownloading(false);
    if (localUri) {
      onStatusChanged?.();
    }
  };

  const handleOpen = async () => {
    if (!note.local_uri) {
      // If not yet downloaded, initiate download
      handleDownload();
      return;
    }
    await openNoteInExternalViewer(note.local_uri, attachment.name);
  };

  const handleDelete = async () => {
    Alert.alert(
      'Remove Download',
      `Delete local copy of "${attachment.name}" to free up device space?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLocalNote(note.id, attachment.name);
            onStatusChanged?.();
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
      {/* Top Header: Subject Badge & Format */}
      <View className="flex-row items-center justify-between mb-2">
        <SubjectBadge
          code={subject?.code || note.subject_id}
          colorName={subject?.color}
          size="sm"
        />

        <View className="flex-row items-center gap-2">
          {note.is_downloaded && (
            <View className="flex-row items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              <Check size={11} color="#34d399" />
              <Text className="text-[10px] font-semibold text-emerald-400">Offline</Text>
            </View>
          )}

          <View className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
            <Text className="text-[10px] font-bold text-zinc-300 uppercase">
              {note.type || 'PDF'}
            </Text>
          </View>
        </View>
      </View>

      {/* Note Title */}
      <Text className="text-base font-semibold text-white mb-1">{note.title}</Text>

      {note.description ? (
        <Text className="text-xs text-zinc-400 mb-3" numberOfLines={2}>
          {note.description}
        </Text>
      ) : null}

      {/* Download Progress Bar */}
      {isDownloading && (
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-[11px] text-zinc-400 font-medium">Downloading...</Text>
            <Text className="text-[11px] text-zinc-300 font-bold">
              {Math.round(downloadProgress * 100)}%
            </Text>
          </View>
          <View className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <View
              style={{ width: `${Math.round(downloadProgress * 100)}%` }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </View>
        </View>
      )}

      {/* Action Strip */}
      <View className="flex-row items-center justify-between pt-2 border-t border-zinc-800/80 mt-1">
        <Text className="text-[11px] text-zinc-400">
          {note.file_size ? formatFileSize(note.file_size) : attachment.name}
        </Text>

        <View className="flex-row items-center gap-2">
          {note.is_downloaded ? (
            <>
              {/* Delete local file */}
              <Pressable
                onPress={handleDelete}
                className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700 items-center justify-center active:bg-rose-500/20 active:border-rose-500/40"
              >
                <Trash2 size={13} color="#a1a1aa" />
              </Pressable>

              {/* Open in Native Intent */}
              <Pressable
                onPress={handleOpen}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 active:bg-indigo-500 shadow-sm"
              >
                <ExternalLink size={13} color="#ffffff" />
                <Text className="text-xs font-semibold text-white">Open</Text>
              </Pressable>
            </>
          ) : (
            /* Download Button */
            <Pressable
              onPress={handleDownload}
              disabled={isDownloading}
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 active:bg-zinc-700"
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Download size={13} color="#e4e4e7" />
              )}
              <Text className="text-xs font-semibold text-zinc-200">
                {isDownloading ? 'Saving...' : 'Download'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};
