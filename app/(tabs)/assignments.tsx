import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopHeader } from '../../components/TopHeader';
import { AssignmentCard } from '../../components/AssignmentCard';
import { Assignment, Subject } from '../../lib/types';
import { getAssignments, getSubjects } from '../../lib/data-repository';
import { CheckSquare, Clock } from 'lucide-react-native';

export default function AssignmentsScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'all'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [fetchedAssignments, fetchedSubjects] = await Promise.all([
        getAssignments(),
        getSubjects(),
      ]);
      setAssignments(fetchedAssignments);
      setSubjects(fetchedSubjects);
    } catch (e) {
      console.warn('Failed to load assignments:', e);
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

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length;

  const filteredAssignments = assignments.filter((a) => {
    if (activeTab === 'pending') return a.status === 'pending';
    if (activeTab === 'submitted') return a.status === 'submitted';
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <TopHeader
        title="DEADLINES"
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Filter Tabs */}
      <View className="px-4 py-3 border-b border-zinc-900 bg-zinc-950 flex-row gap-2">
        <Pressable
          onPress={() => setActiveTab('pending')}
          className={`flex-1 py-2 rounded-lg border items-center justify-center flex-row gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-indigo-600 border-indigo-500'
              : 'bg-zinc-900 border-zinc-800'
          }`}
        >
          <Clock size={13} color={activeTab === 'pending' ? '#ffffff' : '#a1a1aa'} />
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'pending' ? 'text-white' : 'text-zinc-400'
            }`}
          >
            Pending ({pendingCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('submitted')}
          className={`flex-1 py-2 rounded-lg border items-center justify-center flex-row gap-1.5 ${
            activeTab === 'submitted'
              ? 'bg-indigo-600 border-indigo-500'
              : 'bg-zinc-900 border-zinc-800'
          }`}
        >
          <CheckSquare size={13} color={activeTab === 'submitted' ? '#ffffff' : '#a1a1aa'} />
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'submitted' ? 'text-white' : 'text-zinc-400'
            }`}
          >
            Submitted ({submittedCount})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('all')}
          className={`px-3 py-2 rounded-lg border items-center justify-center ${
            activeTab === 'all'
              ? 'bg-indigo-600 border-indigo-500'
              : 'bg-zinc-900 border-zinc-800'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'all' ? 'text-white' : 'text-zinc-400'
            }`}
          >
            All
          </Text>
        </Pressable>
      </View>

      {/* Assignments List */}
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
              Loading deadlines...
            </Text>
          </View>
        ) : filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              subject={subjectMap.get(assignment.subject_id)}
            />
          ))
        ) : (
          <View className="py-16 items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50 mt-4 px-6">
            <CheckSquare size={28} color="#71717a" />
            <Text className="text-base font-semibold text-zinc-300 mt-3">
              {activeTab === 'pending'
                ? 'All caught up!'
                : 'No assignments found'}
            </Text>
            <Text className="text-xs text-zinc-500 text-center mt-1">
              {activeTab === 'pending'
                ? 'You have zero pending deadlines right now.'
                : 'No submitted assignments recorded.'}
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
