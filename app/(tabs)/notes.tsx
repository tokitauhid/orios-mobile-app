import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopHeader } from '../../components/TopHeader';
import { NoteItemCard } from '../../components/NoteItemCard';
import { Note, Subject } from '../../lib/types';
import { getNotes, getSubjects } from '../../lib/data-repository';
import { downloadNoteFile } from '../../lib/download-manager';
import { Search, DownloadCloud, FileText, CheckCircle2 } from 'lucide-react-native';

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [fetchedNotes, fetchedSubjects] = await Promise.all([
        getNotes(),
        getSubjects(),
      ]);
      setNotes(fetchedNotes);
      setSubjects(fetchedSubjects);
    } catch (e) {
      console.warn('Failed to load notes:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Filter notes by subject and search term
  const filteredNotes = notes.filter((note) => {
    const matchesSubject =
      selectedSubjectId === 'all' || note.subject_id === selectedSubjectId;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Bulk download all notes for selected subject
  const handleBulkDownload = async () => {
    const targetNotes = filteredNotes.filter((n) => !n.is_downloaded);
    if (targetNotes.length === 0) {
      Alert.alert('All Downloaded', 'All notes in this view are already stored offline on your device.');
      return;
    }

    Alert.alert(
      'Download All Notes',
      `Download ${targetNotes.length} course material(s) for offline access?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download All',
          onPress: async () => {
            setIsBulkDownloading(true);
            setBulkProgress({ current: 0, total: targetNotes.length });

            for (let i = 0; i < targetNotes.length; i++) {
              const n = targetNotes[i];
              const att = (n.attachments && n.attachments[0]) || {
                name: `${n.title}.${n.type || 'pdf'}`,
                url: n.url,
              };
              if (att.url) {
                await downloadNoteFile(n.id, att.url, att.name);
              }
              setBulkProgress({ current: i + 1, total: targetNotes.length });
            }

            setIsBulkDownloading(false);
            setBulkProgress(null);
            loadData();
            Alert.alert('Complete', 'All notes have been downloaded for offline viewing.');
          },
        },
      ]
    );
  };

  const downloadedCount = notes.filter((n) => n.is_downloaded).length;

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <TopHeader
        title="NOTES"
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Search Input */}
      <View className="px-4 pt-3 pb-2 bg-zinc-950">
        <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
          <Search size={16} color="#71717a" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search notes, slides, handouts..."
            placeholderTextColor="#71717a"
            className="flex-1 text-sm text-white ml-2 py-0"
          />
        </View>
      </View>

      {/* Subject Filter Carousel */}
      <View className="py-2 px-4 border-b border-zinc-900 bg-zinc-950">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <Pressable
            onPress={() => setSelectedSubjectId('all')}
            className={`px-3 py-1.5 rounded-lg border ${
              selectedSubjectId === 'all'
                ? 'bg-indigo-600 border-indigo-500'
                : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                selectedSubjectId === 'all' ? 'text-white' : 'text-zinc-400'
              }`}
            >
              All Subjects
            </Text>
          </Pressable>

          {subjects.map((sub) => {
            const isSelected = sub.id === selectedSubjectId;
            return (
              <Pressable
                key={sub.id}
                onPress={() => setSelectedSubjectId(sub.id)}
                className={`px-3 py-1.5 rounded-lg border ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500'
                    : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isSelected ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  {sub.code}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Bulk Action & Summary Bar */}
      <View className="flex-row items-center justify-between px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-900">
        <View className="flex-row items-center gap-1.5">
          <CheckCircle2 size={13} color="#34d399" />
          <Text className="text-xs text-zinc-400 font-medium">
            {downloadedCount} of {notes.length} available offline
          </Text>
        </View>

        <Pressable
          onPress={handleBulkDownload}
          disabled={isBulkDownloading}
          className="flex-row items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-700 active:bg-zinc-700"
        >
          {isBulkDownloading ? (
            <ActivityIndicator size="small" color="#818cf8" />
          ) : (
            <DownloadCloud size={13} color="#818cf8" />
          )}
          <Text className="text-xs font-semibold text-indigo-300">
            {bulkProgress
              ? `${bulkProgress.current}/${bulkProgress.total}`
              : 'Download All'}
          </Text>
        </Pressable>
      </View>

      {/* Notes List */}
      <ScrollView
        className="flex-1 px-4 pt-3"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#818cf8"
          />
        }
      >
        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#818cf8" />
            <Text className="text-xs text-zinc-400 mt-3 font-medium">
              Loading course notes...
            </Text>
          </View>
        ) : filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteItemCard
              key={note.id}
              note={note}
              subject={subjectMap.get(note.subject_id)}
              onStatusChanged={loadData}
            />
          ))
        ) : (
          <View className="py-16 items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50 mt-4 px-6">
            <FileText size={28} color="#71717a" />
            <Text className="text-base font-semibold text-zinc-300 mt-3">
              No notes found
            </Text>
            <Text className="text-xs text-zinc-500 text-center mt-1">
              Try changing the subject filter or search keyword.
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
