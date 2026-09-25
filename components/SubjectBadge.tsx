import React from 'react';
import { View, Text } from 'react-native';
import { getPalette } from '../lib/subjects';

interface SubjectBadgeProps {
  code: string;
  colorName?: string;
  size?: 'sm' | 'md';
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({
  code,
  colorName,
  size = 'md',
}) => {
  const palette = getPalette(colorName);
  const isSm = size === 'sm';

  return (
    <View
      style={{
        backgroundColor: palette.bg,
        borderColor: palette.border,
      }}
      className={`flex-row items-center border rounded-md ${
        isSm ? 'px-1.5 py-0.5' : 'px-2 py-1'
      }`}
    >
      <View
        style={{ backgroundColor: palette.dot }}
        className="w-1.5 h-1.5 rounded-full mr-1.5"
      />
      <Text
        style={{ color: palette.text }}
        className={`font-semibold ${isSm ? 'text-[11px]' : 'text-xs'}`}
      >
        {code}
      </Text>
    </View>
  );
};
