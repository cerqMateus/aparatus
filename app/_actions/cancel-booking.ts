'use server'
import { actionClient } from "@/lib/action-client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { returnValidationErrors } from "next-safe-action";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inputSchema = z.object({
    bookingId: z.string().uuid(),
});

export const cancelBooking = actionClient
    .inputSchema(inputSchema)
    .action(async ({ parsedInput: { bookingId } }) => {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) {
            returnValidationErrors(inputSchema, {
                _errors: ["Unauthorized"],
            });
        }

        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId,
            },
        });

        if (!booking) {
            returnValidationErrors(inputSchema, {
                _errors: ["Booking not found"],
            });
        }

        if (booking.userId !== session.user.id) {
            returnValidationErrors(inputSchema, {
                _errors: ["Unauthorized"],
            });
        }

        if (booking.cancelled) {
            returnValidationErrors(inputSchema, {
                _errors: ["Booking already cancelled"],
            });
        }

        // Process Stripe refund if booking has a charge ID
        if (booking.stripeChargeId) {
            if (!process.env.STRIPE_SECRET_KEY) {
                returnValidationErrors(inputSchema, {
                    _errors: ["Stripe configuration error"],
                });
            }

            const Stripe = (await import("stripe")).default;
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: "2025-11-17.clover"
            });

            try {
                await stripe.refunds.create({
                    charge: booking.stripeChargeId,
                    reason: "requested_by_customer",
                });
            } catch (error) {
                console.error("Stripe refund error:", error);
                returnValidationErrors(inputSchema, {
                    _errors: ["Failed to process refund"],
                });
            }
        }

        const updatedBooking = await prisma.booking.update({
            where: {
                id: bookingId,
            },
            data: {
                cancelled: true,
                cancelledAt: new Date(),
            },
        });

        revalidatePath("/bookings");

        return updatedBooking;
    });
