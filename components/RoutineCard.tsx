import React from 'react';
import { View, Text } from 'react-native';
import { Clock, MapPin, User } from 'lucide-react-native';
import { SubjectBadge } from './SubjectBadge';
import { RoutineSlot, Subject } from '../lib/types';
import { getPalette } from '../lib/subjects';

interface RoutineCardProps {
  slot: RoutineSlot;
  subject?: Subject;
  isOngoing?: boolean;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({
  slot,
  subject,
  isOngoing = false,
}) => {
  const palette = getPalette(subject?.color);

  return (
    <View
      className={`p-4 rounded-xl mb-3 border ${
        isOngoing
          ? 'bg-zinc-900 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
          : 'bg-zinc-900 border-zinc-800'
      }`}
    >
      {/* Top Header: Time and Subject Badge */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-1.5">
          <Clock size={13} color="#a1a1aa" />
          <Text className="text-xs font-semibold text-zinc-300">{slot.time_label}</Text>
          {isOngoing && (
            <View className="ml-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40">
              <Text className="text-[10px] font-bold text-indigo-400">NOW</Text>
            </View>
          )}
        </View>

        <SubjectBadge
          code={subject?.code || slot.subject_id || 'CLASS'}
          colorName={subject?.color}
          size="sm"
        />
      </View>

      {/* Course Title */}
      <Text className="text-base font-semibold text-white mb-2.5">
        {subject?.name || slot.subject_id || 'Scheduled Period'}
      </Text>

      {/* Meta Footer: Room, Teacher, Type */}
      <View className="flex-row items-center justify-between pt-2 border-t border-zinc-800/80">
        <View className="flex-row items-center gap-1.5">
          <MapPin size={13} color="#71717a" />
          <Text className="text-xs text-zinc-400 font-medium">
            {slot.room || 'TBA'}
          </Text>
        </View>

        {slot.teacher_name ? (
          <View className="flex-row items-center gap-1.5">
            <User size={13} color="#71717a" />
            <Text className="text-xs text-zinc-400 font-medium">
              {slot.teacher_name}
            </Text>
          </View>
        ) : null}

        <View
          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
            slot.type === 'lab'
              ? 'bg-violet-500/10 border-violet-500/30'
              : 'bg-zinc-800 border-zinc-700'
          }`}
        >
          <Text
            className={`text-[10px] font-semibold ${
              slot.type === 'lab' ? 'text-violet-400' : 'text-zinc-400'
            }`}
          >
            {slot.type === 'lab' ? 'LAB' : 'LECTURE'}
          </Text>
        </View>
      </View>
    </View>
  );
};
