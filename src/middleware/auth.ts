import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

interface AuthRequest extends Request {
  user?: { id: string };
  token?: string;
}

const parseCookies = (rc: string | undefined): Record<string, string> => {
  const list: Record<string, string> = {};
  if (!rc) return list;
  rc.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift()!.trim()] = decodeURI(parts.join('='));
  });
  return list;
};

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization as string | undefined;
    let token = authHeader ? authHeader.split(' ')[1] : undefined;

    if (!token && req.headers.cookie) {
      const cookies = parseCookies(req.headers.cookie);
      token = cookies['token'];
    }

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string };

    // Check session in database
    const session = await prisma.session.findUnique({
      where: { token }
    });

    if (!session) {
      res.status(401).json({ message: 'Session expired or revoked' });
      return;
    }

    // Normalize expiresAt to a Date and compare by timestamp to avoid
    // issues where expiresAt may be a number/string/Date object.
    const expiresAt = new Date(session.expiresAt as unknown as string | number | Date);
    if (isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
      await prisma.session.delete({ where: { token } }).catch(() => {});
      res.status(401).json({ message: 'Session expired or revoked' });
      return;
    }

    req.user = { id: decoded.id };
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
};
