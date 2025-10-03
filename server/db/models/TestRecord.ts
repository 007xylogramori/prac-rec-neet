import mongoose, { Schema, Document } from 'mongoose';
import { TestRecord as ITestRecord, QuestionEntry, ChapterStats, Subject } from '@shared/api';

// Question Entry Schema
const QuestionEntrySchema = new Schema<QuestionEntry>({
  number: { type: Number, required: true },
  chapter: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['correct', 'wrong', 'not_attempted'], 
    required: true 
  }
}, { _id: false });

// Chapter Stats Schema
const ChapterStatsSchema = new Schema<ChapterStats>({
  correct: { type: Number, required: true, default: 0 },
  wrong: { type: Number, required: true, default: 0 },
  notAttempted: { type: Number, required: true, default: 0 },
  score: { type: Number, required: true, default: 0 }
}, { _id: false });

// Test Record Schema
const TestRecordSchema = new Schema<ITestRecord & Document>({
  id: { type: String, required: true, unique: true, index: true },
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  subject: { 
    type: String, 
    enum: ['Physics', 'Chemistry', 'Biology'], 
    required: true 
  },
  questionCount: { type: Number, required: true },
  questions: [QuestionEntrySchema],
  dateISO: { type: String, required: true },
  score: { type: Number, required: true },
  correct: { type: Number, required: true },
  wrong: { type: Number, required: true },
  notAttempted: { type: Number, required: true },
  byChapter: { 
    type: Map, 
    of: ChapterStatsSchema,
    default: new Map()
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for better query performance
TestRecordSchema.index({ userId: 1, subject: 1, dateISO: -1 });
TestRecordSchema.index({ userId: 1, dateISO: -1 });

// Prevent model recompilation in development
export const TestRecordModel = mongoose.models.TestRecord || mongoose.model<ITestRecord & Document>('TestRecord', TestRecordSchema);
