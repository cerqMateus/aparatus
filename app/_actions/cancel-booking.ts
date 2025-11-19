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
