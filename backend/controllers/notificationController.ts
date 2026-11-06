import { Response } from 'express';
import { db } from '../utils/databaseStore.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getUserNotifications(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = await db.findNotificationsByUserId(req.user._id);
    return res.json(notifications);
  } catch (err: any) {
    return res.status(500).json({ message: 'Error retrieving notifications', error: err.message });
  }
}

export async function markAsRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await db.markNotificationRead(id);
    return res.json({ message: 'Notification marked as read' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error marking notification read', error: err.message });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const count = await db.markAllNotificationsRead(req.user._id);
    return res.json({ message: `${count} notifications marked as read` });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error marking all notifications read', error: err.message });
  }
}
