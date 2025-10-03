/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type Subject = "Physics" | "Chemistry" | "Biology";
export type QuestionStatus = "correct" | "wrong" | "not_attempted";

export interface QuestionEntry {
  number: number; // 1-based index
  chapter: string; // e.g., "Mechanics" or "Mixed"
  status: QuestionStatus;
}

export interface ChapterStats {
  correct: number;
  wrong: number;
  notAttempted: number;
  score: number; // computed using NEET scoring
}

export interface TestRecord {
  id: string;
  userId?: string; // Optional for backward compatibility
  subject: Subject;
  questionCount: number;
  questions: QuestionEntry[];
  dateISO: string; // ISO string of when saved
  score: number; // total score
  correct: number;
  wrong: number;
  notAttempted: number;
  byChapter: Record<string, ChapterStats>;
}

export interface User {
  id: string;
  email: string;
  name: string;
  guardianEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string; // Required for signup
  guardianEmail?: string; // Optional for signup
}

export interface AuthResponse {
  user: User;
  token: string;
}

export function scoreForStatus(status: QuestionStatus): number {
  if (status === "correct") return 4;
  if (status === "wrong") return -1;
  return 0;
}

export function computeTestAggregates(questions: QuestionEntry[]) {
  const agg: { correct: number; wrong: number; notAttempted: number; score: number; byChapter: Record<string, ChapterStats> } = {
    correct: 0,
    wrong: 0,
    notAttempted: 0,
    score: 0,
    byChapter: {},
  };
  for (const q of questions) {
    const sc = scoreForStatus(q.status);
    agg.score += sc;
    if (q.status === "correct") agg.correct += 1;
    else if (q.status === "wrong") agg.wrong += 1;
    else agg.notAttempted += 1;

    const key = q.chapter.trim() || "Mixed";
    if (!agg.byChapter[key]) {
      agg.byChapter[key] = { correct: 0, wrong: 0, notAttempted: 0, score: 0 };
    }
    const cs = agg.byChapter[key];
    cs.score += sc;
    if (q.status === "correct") cs.correct += 1;
    else if (q.status === "wrong") cs.wrong += 1;
    else cs.notAttempted += 1;
  }
  return agg;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface TestStatsResponse {
  overall: {
    totalTests: number;
    totalQuestions: number;
    totalScore: number;
    avgScore: number;
    subjects: Subject[];
  };
  bySubject: Array<{
    _id: Subject;
    count: number;
    avgScore: number;
    totalQuestions: number;
  }>;
}

export interface DeleteResponse {
  message: string;
  id?: string;
  deletedCount?: number;
}
