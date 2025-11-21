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
        await prisma.booking.create({
            data: {
                barbershopId,
                serviceId,
                userId,
                date
            },
        });
    }
    revalidatePath("/bookings");
    return NextResponse.json({ received: true });
}