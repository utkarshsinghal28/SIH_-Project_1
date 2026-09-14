import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/** Signs a JWT carrying the user id and role (role is re-checked server-side). */
export function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
