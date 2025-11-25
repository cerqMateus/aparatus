import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    trustedOrigins: [
        'http://localhost:3000',
        process.env.BETTER_AUTH_URL || ''
    ].filter(Boolean),
    account: {
        accountLinking: {
            enabled: true
        },
        skipStateCookieCheck: process.env.NODE_ENV === 'production'
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
        }
    }
});