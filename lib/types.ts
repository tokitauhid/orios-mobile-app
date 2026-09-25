export interface Subject {
  id: string;
  code: string;
  name: string;
  short_name?: string;
  color: string;
  credit_hours: number;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
}

export interface Note {
  id: number;
  title: string;
  description?: string;
  subject_id: string;
  type: string;
  url: string;
  attachments?: Attachment[];
  created_at: string;
  is_downloaded?: boolean;
  local_uri?: string;
  file_size?: number;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  subject_id: string;
  due_date: string;
  status: 'pending' | 'submitted';
  file_url?: string;
  attachments?: Attachment[];
  created_at: string;
}

export interface Teacher {
  id: number;
  name: string;
  role: string;
  email: string;
  phone?: string;
  room?: string;
  office_hours?: string;
  initials: string;
}

export interface RoutineSlot {
  day_name: string;
  time_slot_index: number;
  time_label: string;
  subject_id?: string;
  teacher_id?: number;
  teacher_name?: string;
  room?: string;
  type?: 'lecture' | 'lab';
}
