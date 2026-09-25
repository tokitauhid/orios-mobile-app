import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-col items-center gap-1.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 active:bg-zinc-800/80"
    >
      <View className="w-8 h-8 rounded-lg bg-zinc-800 items-center justify-center text-zinc-400">
        <Icon size={16} color="#a1a1aa" />
      </View>
      <View className="items-center">
        <Text className="text-lg font-bold text-white leading-tight">
          {value}
        </Text>
        <Text className="text-[10px] text-zinc-400 mt-0.5 text-center font-medium">
          {label}
        </Text>
      </View>
    </Pressable>
  );
};
