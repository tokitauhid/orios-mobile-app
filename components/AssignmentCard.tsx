import React from 'react';
import { View, Text } from 'react-native';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { Assignment, Subject } from '../lib/types';
import { SubjectBadge } from './SubjectBadge';

interface AssignmentCardProps {
  assignment: Assignment;
  subject?: Subject;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  subject,
}) => {
  const dueDate = new Date(assignment.due_date);
  const now = new Date();
  const diffHours = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffHours / 24);

  const isSubmitted = assignment.status === 'submitted';
  const isOverdue = !isSubmitted && diffHours < 0;

  let badgeColor = 'bg-zinc-800 border-zinc-700 text-zinc-300';
  let badgeText = `${diffDays} days left`;

  if (isSubmitted) {
    badgeColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    badgeText = 'Submitted';
  } else if (isOverdue) {
    badgeColor = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    badgeText = 'Overdue';
  } else if (diffHours < 24) {
    badgeColor = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    badgeText = `Due in ${Math.max(1, diffHours)}h`;
  }

  const formattedDate = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3">
      {/* Header with Subject and Due Badge */}
      <View className="flex-row items-center justify-between mb-2">
        <SubjectBadge
          code={subject?.code || assignment.subject_id}
          colorName={subject?.color}
          size="sm"
        />

        <View className={`px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
          <Text className="text-[11px] font-bold">{badgeText}</Text>
        </View>
      </View>

      {/* Assignment Title */}
      <Text className="text-base font-semibold text-white mb-1.5">
        {assignment.title}
      </Text>

      {assignment.description ? (
        <Text className="text-xs text-zinc-400 mb-3" numberOfLines={2}>
          {assignment.description}
        </Text>
      ) : null}

      {/* Footer: Due Date and Submission status */}
      <View className="flex-row items-center justify-between pt-2 border-t border-zinc-800/80">
        <View className="flex-row items-center gap-1.5">
          <Calendar size={13} color="#71717a" />
          <Text className="text-xs text-zinc-400 font-medium">Due: {formattedDate}</Text>
        </View>

        <View className="flex-row items-center gap-1">
          {isSubmitted ? (
            <CheckCircle2 size={13} color="#34d399" />
          ) : (
            <AlertCircle size={13} color={isOverdue ? '#fb7185' : '#fbbf24'} />
          )}
          <Text
            className={`text-xs font-semibold ${
              isSubmitted
                ? 'text-emerald-400'
                : isOverdue
                ? 'text-rose-400'
                : 'text-amber-400'
            }`}
          >
            {isSubmitted ? 'Completed' : isOverdue ? 'Action Required' : 'Pending'}
          </Text>
        </View>
      </View>
    </View>
  );
};
