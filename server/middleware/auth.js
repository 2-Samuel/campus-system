import jwt from 'jsonwebtoken';
import { db } from '../services/dbService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'university_lecturer_locator_secret_jwt_key_2026';

export const generateToken = (payload, rememberMe = false) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : '24h'
  });
};

export const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No authorization token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await db.findOne('users', { email: decoded.email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User token is invalid or user no longer exists.' });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      profileId: user.profileId
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authorization token.' });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user?.role}' does not have permission for this resource.`
      });
    }
    next();
  };
};
