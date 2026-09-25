import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';

interface CountdownCardProps {
  title: string;
  date: string;
  type?: 'exam' | 'lab' | 'assignment' | string;
  subject?: string;
  onPress?: () => void;
}

function getTimeRemaining(targetDate: string) {
  const diff = new Date(targetDate).getTime() - new Date().getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    expired: false,
  };
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  title,
  date,
  type = 'assignment',
  subject,
  onPress,
}) => {
  const [time, setTime] = useState(() => getTimeRemaining(date));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(date));
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, [date]);

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const isExam = type === 'exam';
  const isLab = type === 'lab';

  const badgeBg = isExam
    ? 'bg-rose-500/15 border-rose-500/30'
    : isLab
    ? 'bg-emerald-500/15 border-emerald-500/30'
    : 'bg-amber-500/15 border-amber-500/30';

  const badgeText = isExam
    ? 'text-rose-400'
    : isLab
    ? 'text-emerald-400'
    : 'text-amber-400';

  return (
    <Pressable
      onPress={onPress}
      className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 mb-2.5 active:bg-zinc-800/80"
    >
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-row items-center gap-1.5">
          <View className={`px-2 py-0.5 rounded-full border ${badgeBg}`}>
            <Text className={`text-[10px] font-bold uppercase tracking-wider ${badgeText}`}>
              {type}
            </Text>
          </View>
          {subject ? (
            <Text className="text-[11px] font-semibold text-zinc-400">
              {subject}
            </Text>
          ) : null}
        </View>

        <Text className="text-xs font-medium text-zinc-400">
          {formattedDate}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-white flex-1 mr-2" numberOfLines={1}>
          {title}
        </Text>

        {time.expired ? (
          <Text className="text-xs text-zinc-500 italic">Passed</Text>
        ) : (
          <View className="flex-row items-center bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-zinc-700/60">
            <Text className="text-xs font-bold text-indigo-400 tabular-nums">
              {time.days}d {time.hours}h {time.minutes}m
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};
