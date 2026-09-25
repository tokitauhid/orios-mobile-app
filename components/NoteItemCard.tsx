import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import {
  FileText,
  FileSpreadsheet,
  Link2,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Trash2,
  Check,
} from 'lucide-react-native';
import { Note, Subject } from '../lib/types';
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
  onStatusChanged,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const rawType = (note.type || 'pdf').toLowerCase();

  const isPdf = rawType.includes('pdf');
  const isDoc = rawType.includes('doc');
  const isPpt = rawType.includes('ppt');
  const isLink = rawType.includes('link') || rawType.includes('url');
  const isImg = rawType.includes('png') || rawType.includes('jpg') || rawType.includes('jpeg') || rawType.includes('image');

  const Icon = isPdf
    ? FileText
    : isDoc || isPpt
    ? FileSpreadsheet
    : isLink
    ? Link2
    : isImg
    ? ImageIcon
    : FileText;

  const iconColor = isPdf
    ? '#f87171' // red-400
    : isDoc
    ? '#60a5fa' // blue-400
    : isPpt
    ? '#fbbf24' // amber-400
    : isLink
    ? '#34d399' // emerald-400
    : '#a1a1aa';

  const badgeBg = isPdf
    ? 'bg-red-500/15 border-red-500/30'
    : isDoc
    ? 'bg-blue-500/15 border-blue-500/30'
    : isPpt
    ? 'bg-amber-500/15 border-amber-500/30'
    : isLink
    ? 'bg-emerald-500/15 border-emerald-500/30'
    : 'bg-zinc-800 border-zinc-700';

  const badgeText = isPdf
    ? 'text-red-400'
    : isDoc
    ? 'text-blue-400'
    : isPpt
    ? 'text-amber-400'
    : isLink
    ? 'text-emerald-400'
    : 'text-zinc-400';

  const badgeLabel = isPdf ? 'PDF' : isDoc ? 'DOC' : isPpt ? 'PPT' : isLink ? 'LINK' : 'FILE';

  const attachment = (note.attachments && note.attachments[0]) || {
    name: `${note.title}.${rawType}`,
    url: note.url,
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
      handleDownload();
      return;
    }
    await openNoteInExternalViewer(note.local_uri, attachment.name);
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Offline File',
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
    <View className="flex-row items-start gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 mb-2.5 active:border-zinc-700">
      {/* File type icon container */}
      <View className="w-10 h-10 rounded-lg bg-zinc-800/90 items-center justify-center shrink-0 mt-0.5">
        <Icon size={18} color={iconColor} />
      </View>

      {/* Content */}
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-sm font-semibold text-zinc-100 flex-1 mr-2" numberOfLines={1}>
            {note.title}
          </Text>
          <View className={`px-1.5 py-0.5 rounded-full border ${badgeBg}`}>
            <Text className={`text-[9px] font-bold uppercase tracking-wider ${badgeText}`}>
              {badgeLabel}
            </Text>
          </View>
        </View>

        {note.description ? (
          <Text className="text-xs text-zinc-400 mb-2" numberOfLines={1}>
            {note.description}
          </Text>
        ) : null}

        {/* Download progress bar */}
        {isDownloading && (
          <View className="mb-2">
            <View className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <View
                style={{ width: `${Math.round(downloadProgress * 100)}%` }}
                className="h-full bg-indigo-500 rounded-full"
              />
            </View>
          </View>
        )}

        {/* Action strip */}
        <View className="flex-row items-center justify-between pt-1 border-t border-zinc-800/60 mt-1">
          <Text className="text-[10px] text-zinc-500">
            {note.file_size ? formatFileSize(note.file_size) : attachment.name}
          </Text>

          <View className="flex-row items-center gap-2">
            {note.is_downloaded ? (
              <>
                <Pressable
                  onPress={handleDelete}
                  className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 items-center justify-center active:bg-rose-500/20"
                >
                  <Trash2 size={12} color="#a1a1aa" />
                </Pressable>

                <Pressable
                  onPress={handleOpen}
                  className="flex-row items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 active:bg-indigo-500"
                >
                  <ExternalLink size={12} color="#ffffff" />
                  <Text className="text-xs font-semibold text-white">Open</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={handleDownload}
                disabled={isDownloading}
                className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 active:bg-zinc-700"
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#818cf8" />
                ) : (
                  <Download size={12} color="#a1a1aa" />
                )}
                <Text className="text-xs font-medium text-zinc-300">
                  {isDownloading ? 'Saving...' : 'Download'}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
