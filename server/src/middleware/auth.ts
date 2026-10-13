import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth';
import prisma from '../config/db';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, name: true, isActive: true },
    });

    if (!dbUser || !dbUser.isActive) {
      res.status(401).json({
        success: false,
        message: 'User account not found or suspended.',
      });
      return;
    }

    req.user = dbUser;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const dbUser = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, email: true, role: true, name: true, isActive: true },
        });
        if (dbUser && dbUser.isActive) {
          req.user = dbUser;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
}
