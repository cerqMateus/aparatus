import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server"
import Stripe from "stripe";

export const POST = async (req: Request) => {
    if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
        return NextResponse.error();
    }
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
        return NextResponse.error();
    }
    const text = await req.text();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const event = stripe.webhooks.constructEvent(text, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const date = session.metadata?.date ? new Date(session.metadata.date) : null;
        const serviceId = session.metadata?.serviceId;
        const barbershopId = session.metadata?.barbershopId;
        const userId = session.metadata?.userId;
        if (!date || !serviceId || !barbershopId || !userId) {
            return NextResponse.error();
        }

        // Retrieve session with expanded payment_intent to get charge ID
        const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['payment_intent']
        });

        // Extract charge ID from the expanded payment_intent
        const paymentIntent = expandedSession.payment_intent as Stripe.PaymentIntent;
        const stripeChargeId = typeof paymentIntent?.latest_charge === 'string'
            ? paymentIntent.latest_charge
            : paymentIntent?.latest_charge?.id;

        await prisma.booking.create({
            data: {
                barbershopId,
                serviceId,
                userId,
                date,
                stripeChargeId: stripeChargeId || null
            },
        });
    }
    revalidatePath("/bookings");
    return NextResponse.json({ received: true });
}