/**
 * NextAuth instance - single place to avoid circular imports with get-session
 */

import NextAuth from 'next-auth';
import { authConfig } from './config';

const instance = NextAuth(authConfig);

export const auth = instance.auth;
export const handlers = instance.handlers;
export const signIn = instance.signIn;
export const signOut = instance.signOut;
