// Centralize environment variables validation
export const env = {
    // Public variables (accessible in client components)
    stripe: {
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string,
    },
    appUrl: process.env.NEXT_PUBLIC_APP_URL as string,
} as const;

// Validate required environment variables
if (typeof window === 'undefined') {
    // Server-side only validations
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
    }
    if (!process.env.BETTER_AUTH_SECRET) {
        throw new Error('BETTER_AUTH_SECRET is not defined');
    }
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }
}

// Client-side validations (only for NEXT_PUBLIC_ variables)
if (!env.stripe.publishableKey) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}
if (!env.appUrl) {
    console.error('NEXT_PUBLIC_APP_URL is not defined');
}
