import { supabase } from './supabase';
import { Subject, Note, Assignment, RoutineSlot, Teacher } from './types';
import * as db from './db';
import * as fallback from './mock-data';
import * as FileSystem from 'expo-file-system/legacy';
import { getLocalPathForNote } from './download-manager';

// ─── Subjects ───
export async function getSubjects(): Promise<Subject[]> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('code', { ascending: true });

    if (!error && data && data.length > 0) {
      db.saveCachedSubjects(data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch subjects failed, falling back to cache:', err);
  }

  // Fallback to SQLite cache
  const cached = db.getCachedSubjects();
  if (cached.length > 0) {
    return cached;
  }

  // Ultimate fallback to mock data
  return fallback.fallbackSubjects;
}

// ─── Notes ───
export async function getNotes(): Promise<Note[]> {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data && data.length > 0) {
      // Check local download status for each note
      const enrichedNotes: Note[] = [];
      for (const n of data) {
        const fileName = (n.attachments && n.attachments[0]?.name) || `${n.title}.${n.type || 'pdf'}`;
        const localPath = getLocalPathForNote(n.id, fileName);
        const fileInfo = await FileSystem.getInfoAsync(localPath);

        enrichedNotes.push({
          ...n,
          is_downloaded: fileInfo.exists,
          local_uri: fileInfo.exists ? localPath : undefined,
          file_size: fileInfo.exists && typeof fileInfo.size === 'number' ? fileInfo.size : undefined,
        });
      }

      db.saveCachedNotes(enrichedNotes);
      return enrichedNotes;
    }
  } catch (err) {
    console.warn('Supabase fetch notes failed, falling back to cache:', err);
  }

  // Fallback to SQLite cache
  const cached = db.getCachedNotes();
  if (cached.length > 0) {
    // Re-verify local file existence
    for (const n of cached) {
      const fileName = (n.attachments && n.attachments[0]?.name) || `${n.title}.${n.type || 'pdf'}`;
      const localPath = getLocalPathForNote(n.id, fileName);
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      n.is_downloaded = fileInfo.exists;
      n.local_uri = fileInfo.exists ? localPath : undefined;
    }
    return cached;
  }

  // Fallback to mock data
  return fallback.fallbackNotes;
}

// ─── Assignments ───
export async function getAssignments(): Promise<Assignment[]> {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('due_date', { ascending: true });

    if (!error && data && data.length > 0) {
      db.saveCachedAssignments(data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch assignments failed, falling back to cache:', err);
  }

  const cached = db.getCachedAssignments();
  if (cached.length > 0) {
    return cached;
  }

  return fallback.fallbackAssignments;
}

// ─── Routine ───
export async function getWeeklyRoutine(): Promise<RoutineSlot[]> {
  try {
    const { data: routineData, error: routineError } = await supabase
      .from('routine')
      .select('*, subjects(code, name, color), teachers(name, room)')
      .order('time_slot_index', { ascending: true });

    if (!routineError && routineData && routineData.length > 0) {
      const slots: RoutineSlot[] = routineData.map((r: any) => ({
        day_name: r.day_name,
        time_slot_index: r.time_slot_index,
        time_label: `${8 + r.time_slot_index}:00 - ${9 + r.time_slot_index}:00`,
        subject_id: r.subject_id,
        teacher_id: r.teacher_id,
        teacher_name: r.teachers?.name || '',
        room: r.room || r.teachers?.room || 'TBA',
        type: r.type || 'lecture',
      }));

      db.saveCachedRoutine(slots);
      return slots;
    }
  } catch (err) {
    console.warn('Supabase fetch routine failed, falling back to cache:', err);
  }

  const cached = db.getCachedRoutine();
  if (cached.length > 0) {
    return cached;
  }

  return fallback.fallbackRoutineSlots;
}

// ─── Teachers ───
export async function getTeachers(): Promise<Teacher[]> {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data && data.length > 0) {
      db.saveCachedTeachers(data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch teachers failed, falling back to cache:', err);
  }

  const cached = db.getCachedTeachers();
  if (cached.length > 0) {
    return cached;
  }

  return fallback.fallbackTeachers;
}
