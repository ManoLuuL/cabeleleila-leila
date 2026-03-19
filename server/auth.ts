import jwt from 'jsonwebtoken'
import type { Request } from 'express'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JwtPayload {
  userId: string
  role: 'client' | 'admin'
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export function extractToken(req: Request): JwtPayload | null {
  const auth = req.headers['authorization']
  if (!auth?.startsWith('Bearer ')) return null
  try {
    return verifyToken(auth.slice(7))
  } catch {
    return null
  }
}
