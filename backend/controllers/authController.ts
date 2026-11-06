import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../utils/databaseStore.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';
import { BloodGroup } from '../models/types.js';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, phone, role = 'donor', city, bloodGroup, age, gender } = req.body;

    if (!name || !email || !password || !phone || !city) {
      return res.status(400).json({ message: 'Name, email, password, phone, and city are required.' });
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await db.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone.trim(),
      role: role === 'admin' ? 'donor' : role, // Admin created via seed or admin elevation
      city: city.trim(),
      status: 'active',
    });

    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await db.createDonor({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        age: age ? Number(age) : 25,
        bloodGroup: (bloodGroup as BloodGroup) || 'O+',
        gender: gender || 'Prefer not to say',
        availability: 'Available',
        verified: false,
        totalDonations: 0,
        bio: 'Newly registered blood donor ready to help the community.',
      });

      // Send welcome notification
      await db.createNotification({
        userId: user._id,
        message: 'Welcome to BloodConnect! Your donor profile has been created. Complete your details to get verified.',
        type: 'system',
        isRead: false,
        link: '/profile',
      });
    } else {
      await db.createNotification({
        userId: user._id,
        message: 'Welcome to BloodConnect! You can now request blood or find registered donors near you.',
        type: 'system',
        isRead: false,
        link: '/request-blood',
      });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: userSafe,
      donor: donorProfile,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error during registration', error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account is suspended. Please contact platform administrators.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const { password: _, ...userSafe } = user;

    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await db.findDonorByUserId(user._id);
    }

    return res.json({
      message: 'Login successful!',
      token,
      user: userSafe,
      donor: donorProfile,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Internal server error during login', error: err.message });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { password: _, ...userSafe } = req.user;
    let donorProfile = null;
    if (req.user.role === 'donor') {
      donorProfile = await db.findDonorByUserId(req.user._id);
    }

    return res.json({
      user: userSafe,
      donor: donorProfile,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error retrieving user profile', error: err.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, phone, city, password } = req.body;
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();
    if (city) updates.city = city.trim();

    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await db.updateUser(req.user._id, updates);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sync donor record if exists
    if (req.user.role === 'donor') {
      await db.updateDonorByUserId(req.user._id, {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(city && { city: city.trim() }),
      });
    }

    const { password: _, ...userSafe } = updatedUser;
    return res.json({
      message: 'Profile updated successfully',
      user: userSafe,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
}
