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
        cookiePrefix: 'better-auth'
    },
    account: {
        accountLinking: {
            enabled: true
        },
        skipStateCookieCheck: true // Necessário para domínios .vercel.app
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
        }
    }
});