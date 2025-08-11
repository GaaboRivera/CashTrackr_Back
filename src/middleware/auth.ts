import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const autenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error('No autorizado');
    return res.status(401).json(error.message);
  }
  const [, token] = bearer.split(' ');

  if (!token) {
    const error = new Error('Token no válido');
    return res.status(401).json(error.message);
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof decode === 'object' && decode.id) {
      req.user = await User.findByPk(decode.id, {
        attributes: ['id', 'name', 'email'],
      });
      next();
    }
  } catch (error) {
    res.status(500).json({ error: 'Token no válido' });
  }
};
