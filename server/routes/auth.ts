import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../db/models/User";
import { AuthRequest, AuthResponse } from "@shared/api";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Helper function to generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper function to format user response
const formatUserResponse = (user: any) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  guardianEmail: user.guardianEmail,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString()
});

// POST /api/auth/signup - User registration
export const signup: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, guardianEmail }: AuthRequest = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email }) as any;
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = new UserModel({
      email,
      password,
      name,
      guardianEmail
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Format response
    const response: AuthResponse = {
      user: formatUserResponse(user),
      token
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user account' });
  }
};

// POST /api/auth/login - User login
export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password }: AuthRequest = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await UserModel.findOne({ email }) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Format response
    const response: AuthResponse = {
      user: formatUserResponse(user),
      token
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

// GET /api/auth/me - Get current user profile
export const getProfile: RequestHandler = async (req, res) => {
  try {
    const authReq = req as any; // Type assertion for middleware
    const user = await UserModel.findById(authReq.user.id).select('-password') as any;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: formatUserResponse(user) });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

// PUT /api/auth/profile - Update user profile
export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const authReq = req as any; // Type assertion for middleware
    const { name, guardianEmail } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (guardianEmail !== undefined) updateData.guardianEmail = guardianEmail;

    const user = await UserModel.findByIdAndUpdate(
      authReq.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password') as any;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: formatUserResponse(user) });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
