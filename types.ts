
export type Role = 'student' | 'faculty';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string; // Mocked for demonstration
  role: Role;
  className?: string; // For students: the class they joined
  avatar?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'tool';
  completed: boolean;
  isCollegeSkill?: boolean;
}

export interface SyllabusModule {
  id: string;
  title: string;
  description: string;
  extractedSkills: string[];
  isCompleted: boolean;
  files?: Array<{ name: string; url: string }>;
}

export interface Submission {
  studentId: string;
  studentName: string;
  status: 'pending' | 'completed';
  score?: number;
  answer?: string;
  submittedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  type: 'assignment' | 'quiz';
  dueDate: string;
  status: 'pending' | 'completed'; // For the current user
  score?: number; // For the current user
  content: string; // Assignment prompt or Quiz question
  options?: string[]; // For quizzes
  correctAnswer?: string; // For quizzes
  attachmentUrl?: string;
  attachmentName?: string;
  submissions?: Submission[]; // For faculty tracking
}

export interface ClassInfo {
  id: string;
  name: string;
  division: string;
  facultyId: string; // Ownership
  modules: SyllabusModule[];
  tasks: Task[];
  files?: Array<{ name: string; url: string }>;
}

export interface StudentStats {
  id: string;
  name: string;
  careerGoal: string;
  careerScore: number;
  completedTasks: number;
  totalTasks: number;
}
