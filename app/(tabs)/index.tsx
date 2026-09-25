import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TopHeader } from '../../components/TopHeader';
import { StatCard } from '../../components/StatCard';
import { CountdownCard } from '../../components/CountdownCard';
import { ScheduleCard } from '../../components/ScheduleCard';
import { OverdueBanner } from '../../components/OverdueBanner';
import { RoutineSlot, Subject, Assignment } from '../../lib/types';
import {
  getWeeklyRoutine,
  getSubjects,
  getAssignments,
} from '../../lib/data-repository';
import { BookOpen, ClipboardList, Clock, Sparkles } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();

  const [routine, setRoutine] = useState<RoutineSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [fetchedSlots, fetchedSubjects, fetchedAssignments] = await Promise.all([
        getWeeklyRoutine(),
        getSubjects(),
        getAssignments(),
      ]);
      setRoutine(fetchedSlots);
      setSubjects(fetchedSubjects);
      setAssignments(fetchedAssignments);
    } catch (e) {
      console.warn('Failed to load home dashboard data:', e);
      setIsOffline(true);
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

  const todayName = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    []
  );

  const todayDateFormatted = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }),
    []
  );

  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  // Today's classes
  const todayClasses = useMemo(() => {
    return routine
      .filter((s) => s.day_name.toLowerCase() === todayName.toLowerCase())
      .sort((a, b) => a.time_slot_index - b.time_slot_index);
  }, [routine, todayName]);

  // Overdue assignments
  const now = new Date();
  const overdueAssignments = useMemo(() => {
    return assignments.filter(
      (a) => a.status === 'pending' && a.due_date && new Date(a.due_date) < now
    );
  }, [assignments, now]);

  // Pending tasks
  const pendingAssignments = useMemo(() => {
    return assignments.filter(
      (a) => a.status === 'pending' && new Date(a.due_date) >= now
    );
  }, [assignments, now]);

  // Upcoming in next 7 days
  const upcomingCount = useMemo(() => {
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return assignments.filter(
      (a) =>
        a.status === 'pending' &&
        new Date(a.due_date) >= now &&
        new Date(a.due_date) <= oneWeekLater
    ).length;
  }, [assignments, now]);

  // Top 3 countdown deadlines
  const upcomingCountdowns = useMemo(() => {
    return [...pendingAssignments]
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
      .slice(0, 3);
  }, [pendingAssignments]);

  const currentHour = new Date().getHours();

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <TopHeader
        title="Orios Class"
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        isOffline={isOffline}
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
        {/* Overdue Alert Banner if any overdue */}
        <OverdueBanner
          overdueItems={overdueAssignments}
          onItemPress={() => router.push('/assignments' as any)}
        />

        {/* Stats Strip matching web StatCards */}
        <View className="flex-row gap-2.5 mb-6">
          <StatCard
            icon={BookOpen}
            value={todayClasses.length}
            label="Classes Today"
            onPress={() => router.push('/schedule' as any)}
          />
          <StatCard
            icon={ClipboardList}
            value={pendingAssignments.length}
            label="Pending Tasks"
            onPress={() => router.push('/assignments' as any)}
          />
          <StatCard
            icon={Clock}
            value={upcomingCount}
            label="Upcoming"
            onPress={() => router.push('/schedule' as any)}
          />
        </View>

        {/* Section: Upcoming Deadlines */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-semibold text-zinc-100">
                Upcoming Deadlines
              </Text>
              <Text className="text-xs text-zinc-500 mt-0.5">
                Countdowns for your next events
              </Text>
            </View>
          </View>

          {upcomingCountdowns.length > 0 ? (
            upcomingCountdowns.map((item) => {
              const sub = subjectMap.get(item.subject_id);
              return (
                <CountdownCard
                  key={item.id}
                  title={item.title}
                  date={item.due_date}
                  type="assignment"
                  subject={sub?.code || item.subject_id}
                  onPress={() => router.push('/assignments' as any)}
                />
              );
            })
          ) : (
            <View className="py-6 items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800/50 px-4">
              <Text className="text-xs text-zinc-400">
                No upcoming deadlines! Keep it up.
              </Text>
            </View>
          )}
        </View>

        {/* Section: Today's Schedule */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-semibold text-zinc-100">
                Today's Schedule
              </Text>
              <Text className="text-xs text-zinc-500 mt-0.5">
                {todayDateFormatted}
              </Text>
            </View>
          </View>

          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="small" color="#818cf8" />
            </View>
          ) : todayClasses.length > 0 ? (
            <View className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-4">
              {todayClasses.map((cls, idx) => {
                const sub = cls.subject_id ? subjectMap.get(cls.subject_id) : undefined;
                const startHour = 8 + cls.time_slot_index;
                const isNow = currentHour === startHour;

                return (
                  <ScheduleCard
                    key={`${cls.day_name}-${idx}`}
                    time={cls.time_label}
                    subject={sub?.code || cls.subject_id || 'Class'}
                    teacher={cls.teacher_name}
                    room={cls.room}
                    type={cls.type}
                    isNow={isNow}
                  />
                );
              })}
            </View>
          ) : (
            <View className="py-10 items-center justify-center rounded-xl bg-zinc-900/30 border border-zinc-800/50 px-4">
              <Sparkles size={24} color="#818cf8" />
              <Text className="text-sm font-semibold text-zinc-200 mt-2">
                No classes today!
              </Text>
              <Text className="text-xs text-zinc-500 mt-1">
                Enjoy your day off or catch up on course notes.
              </Text>
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
