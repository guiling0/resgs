import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'resgs-secret';
const EXPIRES_IN = '2h';

export interface TokenPayload {
    userId: string;
    username: string;
}

export function signToken(payload: TokenPayload) {
    return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
}
