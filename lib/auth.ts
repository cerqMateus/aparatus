import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

const isProduction = process.env.NODE_ENV === 'production';
const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    baseURL,
    trustedOrigins: [baseURL],
    advanced: {
        useSecureCookies: isProduction,
        cookiePrefix: 'better-auth',
        generateId: () => crypto.randomUUID()
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60
        }
    },
    account: {
        accountLinking: {
            enabled: true
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            // Não define redirectURI - deixa o Better Auth usar o padrão baseURL + /api/auth/callback/google
        }
    },
    // CRÍTICO: Desabilita a verificação de state cookie completamente
    skipCSRFCheck: true
});