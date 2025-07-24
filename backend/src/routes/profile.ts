import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif)'));
    }
  }
});

// Get user profile
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        // profileImage: true,
        // notificationSettings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Update user profile
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Este email ya está en uso' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        // profileImage: true,
        // notificationSettings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Upload profile image
router.post('/upload-image', authenticate, upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se seleccionó ninguna imagen' });
    }

    // Get current user to delete old image if exists
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { }
    });

    // Delete old profile image if exists
    // Eliminar imagen anterior solo si existe la propiedad en el modelo

    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        // profileImage: true,
        // notificationSettings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Update notification settings
router.put('/notification-settings', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { emailNotifications, pushNotifications, smsNotifications } = req.body;

    const notificationSettings = {
      emailNotifications: emailNotifications ?? true,
      pushNotifications: pushNotifications ?? true,
      smsNotifications: smsNotifications ?? false
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { /* notificationSettings */ },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        // profileImage: true,
        // notificationSettings: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
