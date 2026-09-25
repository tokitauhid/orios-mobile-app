import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Assignment } from '../lib/types';

interface OverdueBannerProps {
  overdueItems: Assignment[];
  onItemPress?: (item: Assignment) => void;
}

export const OverdueBanner: React.FC<OverdueBannerProps> = ({
  overdueItems,
  onItemPress,
}) => {
  if (!overdueItems || overdueItems.length === 0) return null;

  return (
    <View className="rounded-2xl border border-rose-500/25 bg-rose-950/20 p-3.5 mb-4">
      <View className="flex-row items-center gap-2 mb-1.5">
        <View className="w-6 h-6 rounded-lg bg-rose-500/15 items-center justify-center">
          <AlertTriangle size={14} color="#fb7185" />
        </View>
        <Text className="text-sm font-semibold text-rose-400">
          Attention: Overdue Tasks ({overdueItems.length})
        </Text>
      </View>

      <Text className="text-xs text-rose-300/80 mb-2.5 ml-0.5">
        You have tasks that are past their due dates.
      </Text>

      <View className="gap-1.5">
        {overdueItems.slice(0, 3).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onItemPress?.(item)}
            className="flex-row items-center justify-between p-2 rounded-xl bg-zinc-900/90 border border-rose-900/40 active:bg-zinc-800"
          >
            <Text className="text-xs font-medium text-zinc-200 flex-1 mr-2" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-[10px] font-bold text-rose-400">
              Overdue
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};
