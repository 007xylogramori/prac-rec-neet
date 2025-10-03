import { RequestHandler } from "express";
import { TestRecordModel } from "../db/models/TestRecord";
import { UserModel } from "../db/models/User";
import { TestRecord } from "@shared/api";
import { AuthRequest } from "../middleware/auth";
import { sendTestResultsEmail } from "../services/emailService";

// GET /api/tests - Get all test records for authenticated user
export const getAllTests: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const tests = await TestRecordModel.find({ userId: authReq.user?.id })
      .sort({ dateISO: -1 }) // Sort by date descending (newest first)
      .lean() as TestRecord[];
    
    res.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

// GET /api/tests/:id - Get a specific test record
export const getTestById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    const test = await TestRecordModel.findOne({ id, userId: authReq.user?.id }).lean() as TestRecord | null;
    
    if (!test) {
      return res.status(404).json({ error: 'Test record not found' });
    }
    
    res.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
};

// POST /api/tests - Create a new test record
export const createTest: RequestHandler = async (req, res) => {
  try {
    const testData: TestRecord = req.body;
    const authReq = req as AuthRequest;
    
    // Validate required fields
    if (!testData.id || !testData.subject || !testData.questions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if test with this ID already exists for this user
    const existingTest = await TestRecordModel.findOne({ id: testData.id, userId: authReq.user?.id }) as TestRecord | null;
    if (existingTest) {
      return res.status(409).json({ error: 'Test record with this ID already exists' });
    }
    
    const newTest = new TestRecordModel({
      ...testData,
      userId: authReq.user?.id
    });
    const savedTest = await newTest.save();
    
    res.status(201).json(savedTest);
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
};

// PUT /api/tests/:id - Update a test record
export const updateTest: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData: Partial<TestRecord> = req.body;
    const authReq = req as AuthRequest;
    
    const updatedTest = await TestRecordModel.findOneAndUpdate(
      { id, userId: authReq.user?.id },
      updateData,
      { new: true, runValidators: true }
    ).lean() as TestRecord | null;
    
    if (!updatedTest) {
      return res.status(404).json({ error: 'Test record not found' });
    }
    
    res.json(updatedTest);
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
};

// DELETE /api/tests/:id - Delete a test record
export const deleteTest: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    
    const deletedTest = await TestRecordModel.findOneAndDelete({ id, userId: authReq.user?.id }).lean() as TestRecord | null;
    
    if (!deletedTest) {
      return res.status(404).json({ error: 'Test record not found' });
    }
    
    res.json({ message: 'Test record deleted successfully', id });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
};

// DELETE /api/tests - Delete all test records for authenticated user
export const deleteAllTests: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const result = await TestRecordModel.deleteMany({ userId: authReq.user?.id }) as any;
    
    res.json({ 
      message: 'All test records deleted successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error deleting all tests:', error);
    res.status(500).json({ error: 'Failed to delete all tests' });
  }
};

// GET /api/tests/stats/summary - Get test statistics summary for authenticated user
export const getTestStats: RequestHandler = async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.id;
    
    const stats = await TestRecordModel.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          totalQuestions: { $sum: '$questionCount' },
          totalScore: { $sum: '$score' },
          avgScore: { $avg: '$score' },
          subjects: { $addToSet: '$subject' }
        }
      }
    ]) as any[];
    
    const subjectStats = await TestRecordModel.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          avgScore: { $avg: '$score' },
          totalQuestions: { $sum: '$questionCount' }
        }
      }
    ]) as any[];
    
    res.json({
      overall: stats[0] || {
        totalTests: 0,
        totalQuestions: 0,
        totalScore: 0,
        avgScore: 0,
        subjects: []
      },
      bySubject: subjectStats
    });
  } catch (error) {
    console.error('Error fetching test stats:', error);
    res.status(500).json({ error: 'Failed to fetch test statistics' });
  }
};

// POST /api/tests/:id/send-email - Send test results via email
export const sendTestEmail: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;
    
    // Get the test record
    const test = await TestRecordModel.findOne({ id, userId: authReq.user?.id }).lean() as TestRecord | null;
    if (!test) {
      return res.status(404).json({ error: 'Test record not found' });
    }
    
    // Get the user
    const user = await UserModel.findById(authReq.user?.id).select('-password') as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Send email
    const emailSent = await sendTestResultsEmail(user, test);
    
    if (emailSent) {
      res.json({ message: 'Test results sent successfully via email' });
    } else {
      res.status(400).json({ error: 'Failed to send email. Please check if guardian email is configured.' });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ error: 'Failed to send test results email' });
  }
};
