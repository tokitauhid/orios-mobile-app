import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopHeader } from '../../components/TopHeader';
import { Teacher } from '../../lib/types';
import { getTeachers } from '../../lib/data-repository';
import { getStorageUsage, clearAllLocalNotes } from '../../lib/download-manager';
import {
  HardDrive,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Info,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';

export default function MoreScreen() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [storageUsage, setStorageUsage] = useState({ totalBytes: 0, fileCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [fetchedTeachers, usage] = await Promise.all([
        getTeachers(),
        getStorageUsage(),
      ]);
      setTeachers(fetchedTeachers);
      setStorageUsage(usage);
    } catch (e) {
      console.warn('Failed to load more screen data:', e);
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

  const handleClearCache = () => {
    Alert.alert(
      'Clear Downloaded Notes',
      `This will remove ${storageUsage.fileCount} downloaded note file(s) from your device to free up storage. You can re-download them anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Storage',
          style: 'destructive',
          onPress: async () => {
            await clearAllLocalNotes();
            loadData();
            Alert.alert('Storage Cleared', 'Downloaded notes cache has been cleared.');
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <TopHeader
        title="MORE"
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

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
        {/* Section 1: Offline Storage Management */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 ml-1">
            Offline Storage
          </Text>

          <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 items-center justify-center">
                  <HardDrive size={18} color="#818cf8" />
                </View>
                <View>
                  <Text className="text-sm font-semibold text-white">Course Materials</Text>
                  <Text className="text-xs text-zinc-400">
                    {storageUsage.fileCount} file(s) saved offline
                  </Text>
                </View>
              </View>

              <Text className="text-base font-bold text-indigo-400">
                {formatBytes(storageUsage.totalBytes)}
              </Text>
            </View>

            {storageUsage.fileCount > 0 && (
              <Pressable
                onPress={handleClearCache}
                className="flex-row items-center justify-center gap-2 py-2 px-3 rounded-lg bg-zinc-800/80 border border-zinc-700 active:bg-rose-500/20 active:border-rose-500/40"
              >
                <Trash2 size={13} color="#fb7185" />
                <Text className="text-xs font-semibold text-rose-400">
                  Clear Downloaded Files
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Section 2: Faculty Directory */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 ml-1">
            Faculty Directory
          </Text>

          {isLoading ? (
            <ActivityIndicator size="small" color="#818cf8" />
          ) : teachers.length > 0 ? (
            teachers.map((teacher) => (
              <View
                key={teacher.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3"
              >
                <View className="flex-row items-center gap-3 mb-2.5">
                  <View className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 items-center justify-center">
                    <Text className="text-sm font-bold text-indigo-400">
                      {teacher.initials}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-white">
                      {teacher.name}
                    </Text>
                    <Text className="text-xs text-zinc-400">{teacher.role}</Text>
                  </View>
                </View>

                {/* Teacher Details */}
                <View className="pt-2 border-t border-zinc-800/70 gap-1.5">
                  {teacher.room && (
                    <View className="flex-row items-center gap-2">
                      <MapPin size={12} color="#71717a" />
                      <Text className="text-xs text-zinc-400">{teacher.room}</Text>
                    </View>
                  )}
                  {teacher.office_hours && (
                    <View className="flex-row items-center gap-2">
                      <Clock size={12} color="#71717a" />
                      <Text className="text-xs text-zinc-400">{teacher.office_hours}</Text>
                    </View>
                  )}
                </View>

                {/* Contact Actions */}
                <View className="flex-row gap-2 mt-3 pt-2 border-t border-zinc-800/70">
                  {teacher.email && (
                    <Pressable
                      onPress={() => Linking.openURL(`mailto:${teacher.email}`)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 active:bg-zinc-700"
                    >
                      <Mail size={12} color="#a1a1aa" />
                      <Text className="text-xs font-semibold text-zinc-300">Email</Text>
                    </Pressable>
                  )}

                  {teacher.phone && (
                    <Pressable
                      onPress={() => Linking.openURL(`tel:${teacher.phone}`)}
                      className="flex-1 flex-row items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 active:bg-zinc-700"
                    >
                      <Phone size={12} color="#a1a1aa" />
                      <Text className="text-xs font-semibold text-zinc-300">Call</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text className="text-xs text-zinc-500">No faculty members found.</Text>
          )}
        </View>

        {/* Section 3: App Information */}
        <View className="mb-8">
          <Text className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 ml-1">
            Application Info
          </Text>

          <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <Info size={15} color="#71717a" />
                <Text className="text-xs font-medium text-zinc-300">Version</Text>
              </View>
              <Text className="text-xs font-semibold text-zinc-400">1.0.0 (Native Android)</Text>
            </View>

            <View className="flex-row items-center justify-between pt-2 border-t border-zinc-800">
              <View className="flex-row items-center gap-2.5">
                <ShieldCheck size={15} color="#34d399" />
                <Text className="text-xs font-medium text-zinc-300">Build Target</Text>
              </View>
              <Text className="text-xs font-semibold text-emerald-400">Direct Native APK</Text>
            </View>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
