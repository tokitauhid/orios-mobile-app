import React from 'react';
import { View, Text } from 'react-native';

interface ScheduleCardProps {
  time: string;
  subject: string;
  teacher?: string;
  room?: string;
  type?: string;
  isNow?: boolean;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  time,
  subject,
  teacher,
  room,
  type = 'lecture',
  isNow = false,
}) => {
  const isLab = type?.toLowerCase() === 'lab';

  return (
    <View className="flex-row items-stretch gap-2.5">
      {/* Time column */}
      <View className="items-center w-14 shrink-0 pt-1">
        <Text className="text-xs font-semibold text-zinc-200">
          {time}
        </Text>
      </View>

      {/* Connector line */}
      <View className="items-center w-3 shrink-0">
        <View
          className={`w-2.5 h-2.5 rounded-full border-2 mt-1.5 ${
            isNow
              ? 'border-indigo-400 bg-indigo-400'
              : isLab
              ? 'border-emerald-400 bg-emerald-500/20'
              : 'border-indigo-400 bg-indigo-500/20'
          }`}
        />
        <View className="w-[1px] flex-1 bg-zinc-800" />
      </View>

      {/* Content card */}
      <View className="flex-1 pb-3">
        <View
          className={`rounded-xl bg-zinc-900 border p-3 ${
            isNow
              ? 'border-indigo-500/50 shadow-sm shadow-indigo-500/10'
              : 'border-zinc-800/80'
          }`}
        >
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm font-semibold text-zinc-100 flex-1 mr-2" numberOfLines={1}>
              {subject}
            </Text>
            <View className="flex-row items-center gap-1.5 shrink-0">
              {isNow && (
                <View className="px-1.5 py-0.5 rounded-full bg-indigo-500">
                  <Text className="text-[9px] font-bold uppercase tracking-wider text-white">
                    Now
                  </Text>
                </View>
              )}
              <View
                className={`px-2 py-0.5 rounded-full ${
                  isLab
                    ? 'bg-emerald-500/15 border border-emerald-500/30'
                    : 'bg-indigo-500/15 border border-indigo-500/30'
                }`}
              >
                <Text
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isLab ? 'text-emerald-400' : 'text-indigo-400'
                  }`}
                >
                  {isLab ? 'Lab' : 'Lecture'}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-xs text-zinc-400">
            {room ? `Room ${room}` : 'TBA'}
            {teacher ? ` · ${teacher}` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
};
