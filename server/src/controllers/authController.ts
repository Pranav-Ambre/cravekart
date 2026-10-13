import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import prisma from '../config/db';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { sendEmail } from '../utils/emailService';
import { AuthenticatedRequest } from '../middleware/auth';
import { env } from '../config/env';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
      return;
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone || null,
        role: 'CUSTOMER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const data = updateProfileSchema.parse(req.body);
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;

    if (data.newPassword) {
      if (!data.currentPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        });
        return;
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!currentUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const isMatch = await comparePassword(data.currentPassword, currentUser.passwordHash);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Current password is incorrect' });
        return;
      }

      updateData.passwordHash = await hashPassword(data.newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success anyway to avoid user enumeration
      res.json({
        success: true,
        message: 'If an account exists with this email, a reset code has been sent.',
      });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your CraveKart password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#F97316;color:white;text-decoration:none;border-radius:6px;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.json({
      success: true,
      message: 'If an account exists with this email, a reset code has been sent.',
      devToken: process.env.NODE_ENV !== 'production' ? token : undefined,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, newPassword } = z
      .object({
        token: z.string().min(1, 'Token is required'),
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
      })
      .parse(req.body);

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.isUsed || resetRecord.expiresAt < new Date()) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link.',
      });
      return;
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
    ]);

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
}
