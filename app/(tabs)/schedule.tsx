import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { ScheduleCard } from '../../components/ScheduleCard';
import { RoutineSlot, Subject } from '../../lib/types';
import { getWeeklyRoutine, getSubjects } from '../../lib/data-repository';
import { CalendarDays, Sparkles } from 'lucide-react-native';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function ScheduleScreen() {
  const currentDayName = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    []
  );

  const [selectedDay, setSelectedDay] = useState<string>(() => {
    return DAYS.includes(currentDayName) ? currentDayName : 'Saturday';
  });

  const [routine, setRoutine] = useState<RoutineSlot[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [fetchedSlots, fetchedSubjects] = await Promise.all([
        getWeeklyRoutine(),
        getSubjects(),
      ]);
      setRoutine(fetchedSlots);
      setSubjects(fetchedSubjects);
    } catch (e) {
      console.warn('Failed to load schedule data:', e);
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

  // Filter slots for the selected day
  const daySlots = useMemo(() => {
    return routine
      .filter((s) => s.day_name.toLowerCase() === selectedDay.toLowerCase())
      .sort((a, b) => a.time_slot_index - b.time_slot_index);
  }, [routine, selectedDay]);

  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const isViewingToday = currentDayName.toLowerCase() === selectedDay.toLowerCase();
  const currentHour = new Date().getHours();

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <TopHeader
        title="SCHEDULE"
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        isOffline={isOffline}
      />

      {/* Day Selector Strip matching web DayView tabs */}
      <View className="py-2.5 px-4 border-b border-zinc-900 bg-zinc-950">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {DAYS.map((day) => {
            const isSelected = day === selectedDay;
            const isToday = day.toLowerCase() === currentDayName.toLowerCase();

            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`px-3.5 py-1.5 rounded-xl border flex-col items-center gap-0.5 active:scale-95 ${
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
                  {day.slice(0, 3)}
                </Text>
                {isToday && (
                  <View
                    className={`w-1 h-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-indigo-400'
                    }`}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Content Area */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#818cf8"
          />
        }
      >
        {/* Banner with Day Stats */}
        <View className="flex-row items-center justify-between mb-4 bg-zinc-900/60 border border-zinc-800/80 px-4 py-3 rounded-xl">
          <View className="flex-row items-center gap-2">
            <CalendarDays size={16} color="#818cf8" />
            <Text className="text-sm font-semibold text-zinc-200">
              {selectedDay} Routine
            </Text>
          </View>
          <Text className="text-xs text-zinc-400 font-medium">
            {daySlots.length} {daySlots.length === 1 ? 'Period' : 'Periods'}
          </Text>
        </View>

        {isLoading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#818cf8" />
            <Text className="text-xs text-zinc-400 mt-3 font-medium">
              Loading schedule...
            </Text>
          </View>
        ) : daySlots.length > 0 ? (
          <View className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-4 mb-4">
            {daySlots.map((slot) => {
              const subject = slot.subject_id ? subjectMap.get(slot.subject_id) : undefined;
              const startHour = 8 + slot.time_slot_index;
              const isNow = isViewingToday && currentHour === startHour;

              return (
                <ScheduleCard
                  key={`${slot.day_name}-${slot.time_slot_index}`}
                  time={slot.time_label}
                  subject={subject?.code || slot.subject_id || 'Scheduled Period'}
                  teacher={slot.teacher_name}
                  room={slot.room}
                  type={slot.type}
                  isNow={isNow}
                />
              );
            })}
          </View>
        ) : (
          <View className="py-16 items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-800/50 mt-4 px-6">
            <Sparkles size={28} color="#71717a" />
            <Text className="text-base font-semibold text-zinc-300 mt-3">
              No classes scheduled
            </Text>
            <Text className="text-xs text-zinc-500 text-center mt-1">
              Enjoy your day off or catch up on course notes.
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
