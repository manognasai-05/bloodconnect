import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../utils/databaseStore.js';
import { IUser, UserRole } from '../models/types.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'bloodconnect_secure_jwt_secret_token_2026';

export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };

    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found or token expired.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account has been suspended. Please contact admin.' });
    }

    req.user = user;
    next();
  } catch (error: any) {
    return res.status(401).json({ message: 'Invalid or expired token.', error: error.message });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: This resource requires one of [${allowedRoles.join(', ')}] roles, but user is ${req.user.role}`,
      });
    }

    next();
  };
}
