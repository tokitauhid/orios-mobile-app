import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react-native';

interface TopHeaderProps {
  title?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isOffline?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = 'ORIOS',
  isRefreshing = false,
  onRefresh,
  isOffline = false,
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View className="px-5 pt-3 pb-3 bg-zinc-950 border-b border-zinc-900 flex-row items-center justify-between">
      <View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xl font-bold tracking-tight text-white">{title}</Text>
          <View className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
            <Text className="text-[10px] font-semibold text-zinc-300">PORTAL</Text>
          </View>
        </View>
        <Text className="text-xs text-zinc-400 font-medium mt-0.5">{today}</Text>
      </View>

      <View className="flex-row items-center gap-2">
        {/* Offline Status Indicator */}
        <View
          className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${
            isOffline
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}
        >
          {isOffline ? (
            <>
              <WifiOff size={12} color="#fbbf24" />
              <Text className="text-[11px] font-semibold text-amber-400">Offline</Text>
            </>
          ) : (
            <>
              <Wifi size={12} color="#34d399" />
              <Text className="text-[11px] font-semibold text-emerald-400">Live</Text>
            </>
          )}
        </View>

        {/* Sync / Refresh Button */}
        {onRefresh && (
          <Pressable
            onPress={onRefresh}
            disabled={isRefreshing}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center active:scale-95 active:bg-zinc-800"
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color="#a1a1aa" />
            ) : (
              <RefreshCw size={14} color="#a1a1aa" />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
};
