import * as SQLite from 'expo-sqlite';
import { Subject, Note, Assignment, Teacher, RoutineSlot } from './types';

let dbInstance: SQLite.SQLiteDatabase | null = null;

function getDb(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('orios_mobile.db');
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cached_subjects (
      id TEXT PRIMARY KEY,
      code TEXT,
      name TEXT,
      color TEXT,
      credit_hours REAL,
      raw_json TEXT
    );

    CREATE TABLE IF NOT EXISTS cached_notes (
      id INTEGER PRIMARY KEY,
      title TEXT,
      description TEXT,
      subject_id TEXT,
      type TEXT,
      url TEXT,
      attachments_json TEXT,
      created_at TEXT,
      local_uri TEXT
    );

    CREATE TABLE IF NOT EXISTS cached_assignments (
      id INTEGER PRIMARY KEY,
      title TEXT,
      description TEXT,
      subject_id TEXT,
      due_date TEXT,
      status TEXT,
      raw_json TEXT
    );

    CREATE TABLE IF NOT EXISTS cached_routine (
      day_name TEXT,
      time_slot_index INTEGER,
      time_label TEXT,
      subject_id TEXT,
      teacher_name TEXT,
      room TEXT,
      type TEXT,
      PRIMARY KEY (day_name, time_slot_index)
    );

    CREATE TABLE IF NOT EXISTS cached_teachers (
      id INTEGER PRIMARY KEY,
      name TEXT,
      role TEXT,
      email TEXT,
      phone TEXT,
      room TEXT,
      office_hours TEXT,
      initials TEXT
    );
  `);
}

// ─── Subjects ───
export function saveCachedSubjects(subjects: Subject[]) {
  try {
    const db = getDb();
    db.runSync('DELETE FROM cached_subjects');
    const stmt = db.prepareSync(
      'INSERT OR REPLACE INTO cached_subjects (id, code, name, color, credit_hours, raw_json) VALUES (?, ?, ?, ?, ?, ?)'
    );
    for (const s of subjects) {
      stmt.executeSync([s.id, s.code, s.name, s.color, s.credit_hours, JSON.stringify(s)]);
    }
    stmt.finalizeSync();
  } catch (e) {
    console.warn('Failed to cache subjects:', e);
  }
}

export function getCachedSubjects(): Subject[] {
  try {
    const db = getDb();
    const rows = db.getAllSync<{ raw_json: string }>('SELECT raw_json FROM cached_subjects');
    return rows.map((r) => JSON.parse(r.raw_json));
  } catch (e) {
    console.warn('Failed to read cached subjects:', e);
    return [];
  }
}

// ─── Notes ───
export function saveCachedNotes(notes: Note[]) {
  try {
    const db = getDb();
    const stmt = db.prepareSync(
      `INSERT OR REPLACE INTO cached_notes 
       (id, title, description, subject_id, type, url, attachments_json, created_at, local_uri) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT local_uri FROM cached_notes WHERE id = ?), ?))`
    );
    for (const n of notes) {
      stmt.executeSync([
        n.id,
        n.title,
        n.description || '',
        n.subject_id,
        n.type,
        n.url,
        JSON.stringify(n.attachments || []),
        n.created_at,
        n.id,
        n.local_uri || null,
      ]);
    }
    stmt.finalizeSync();
  } catch (e) {
    console.warn('Failed to cache notes:', e);
  }
}

export function updateNoteLocalUri(noteId: number, localUri: string | null) {
  try {
    const db = getDb();
    db.runSync('UPDATE cached_notes SET local_uri = ? WHERE id = ?', [localUri, noteId]);
  } catch (e) {
    console.warn('Failed to update note local uri:', e);
  }
}

export function getCachedNotes(): Note[] {
  try {
    const db = getDb();
    const rows = db.getAllSync<{
      id: number;
      title: string;
      description: string;
      subject_id: string;
      type: string;
      url: string;
      attachments_json: string;
      created_at: string;
      local_uri: string | null;
    }>('SELECT * FROM cached_notes ORDER BY id DESC');

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      subject_id: r.subject_id,
      type: r.type,
      url: r.url,
      attachments: r.attachments_json ? JSON.parse(r.attachments_json) : [],
      created_at: r.created_at,
      local_uri: r.local_uri || undefined,
      is_downloaded: !!r.local_uri,
    }));
  } catch (e) {
    console.warn('Failed to read cached notes:', e);
    return [];
  }
}

// ─── Assignments ───
export function saveCachedAssignments(assignments: Assignment[]) {
  try {
    const db = getDb();
    db.runSync('DELETE FROM cached_assignments');
    const stmt = db.prepareSync(
      'INSERT OR REPLACE INTO cached_assignments (id, title, description, subject_id, due_date, status, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const a of assignments) {
      stmt.executeSync([a.id, a.title, a.description || '', a.subject_id, a.due_date, a.status, JSON.stringify(a)]);
    }
    stmt.finalizeSync();
  } catch (e) {
    console.warn('Failed to cache assignments:', e);
  }
}

export function getCachedAssignments(): Assignment[] {
  try {
    const db = getDb();
    const rows = db.getAllSync<{ raw_json: string }>('SELECT raw_json FROM cached_assignments ORDER BY due_date ASC');
    return rows.map((r) => JSON.parse(r.raw_json));
  } catch (e) {
    console.warn('Failed to read cached assignments:', e);
    return [];
  }
}

// ─── Routine ───
export function saveCachedRoutine(slots: RoutineSlot[]) {
  try {
    const db = getDb();
    db.runSync('DELETE FROM cached_routine');
    const stmt = db.prepareSync(
      'INSERT OR REPLACE INTO cached_routine (day_name, time_slot_index, time_label, subject_id, teacher_name, room, type) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const s of slots) {
      stmt.executeSync([
        s.day_name,
        s.time_slot_index,
        s.time_label,
        s.subject_id || '',
        s.teacher_name || '',
        s.room || '',
        s.type || 'lecture',
      ]);
    }
    stmt.finalizeSync();
  } catch (e) {
    console.warn('Failed to cache routine:', e);
  }
}

export function getCachedRoutine(): RoutineSlot[] {
  try {
    const db = getDb();
    return db.getAllSync<RoutineSlot>('SELECT * FROM cached_routine ORDER BY time_slot_index ASC');
  } catch (e) {
    console.warn('Failed to read cached routine:', e);
    return [];
  }
}

// ─── Teachers ───
export function saveCachedTeachers(teachers: Teacher[]) {
  try {
    const db = getDb();
    db.runSync('DELETE FROM cached_teachers');
    const stmt = db.prepareSync(
      'INSERT OR REPLACE INTO cached_teachers (id, name, role, email, phone, room, office_hours, initials) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const t of teachers) {
      stmt.executeSync([t.id, t.name, t.role, t.email, t.phone || '', t.room || '', t.office_hours || '', t.initials]);
    }
    stmt.finalizeSync();
  } catch (e) {
    console.warn('Failed to cache teachers:', e);
  }
}

export function getCachedTeachers(): Teacher[] {
  try {
    const db = getDb();
    return db.getAllSync<Teacher>('SELECT * FROM cached_teachers ORDER BY name ASC');
  } catch (e) {
    console.warn('Failed to read cached teachers:', e);
    return [];
  }
}
