// server/src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Employee from '../models/Employee';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    employeeId?: string;
  };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'accès requis'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou utilisateur désactivé'
      });
    }
    
    // Si l'utilisateur est un employé, récupérer son ID employé
    let employeeId;
    if (user.role === 'employe') {
      const employee = await Employee.findOne({ user: user._id });
      employeeId = employee?._id.toString();
    }
    
    req.user = {
      id: user._id.toString(),
      role: user.role,
      employeeId
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Privilèges insuffisants'
      });
    }
    next();
  };
};