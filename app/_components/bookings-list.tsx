"use client";

import { useState } from "react";
import BookingItem from "./booking-item";
import { CancelBookingSheet } from "./cancel-booking-sheet";
import {
  Booking,
  BarbershopService,
  Barbershop,
} from "../generated/prisma/client";

interface BookingsListProps {
  bookings: (Booking & {
    service: BarbershopService;
    barbershop: Barbershop;
  })[];
}

export function BookingsList({ bookings }: BookingsListProps) {
  const [selectedBooking, setSelectedBooking] = useState<
    (Booking & { service: BarbershopService; barbershop: Barbershop }) | null
  >(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const now = new Date();

  const confirmedBookings = bookings.filter(
    (booking) => booking.date > now && !booking.cancelled,
  );

  const finishedBookings = bookings.filter(
    (booking) => booking.date <= now || booking.cancelled,
  );

  const handleBookingClick = (
    booking: Booking & { service: BarbershopService; barbershop: Barbershop },
  ) => {
    setSelectedBooking(booking);
    setSheetOpen(true);
  };

  return (
    <>
      {confirmedBookings.length === 0 && finishedBookings.length === 0 && (
        <p className="text-muted-foreground">
          Você ainda não tem agendamentos.
        </p>
      )}

      {confirmedBookings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-muted-foreground mb-3 text-xs font-bold uppercase">
            Confirmados
          </h2>
          <div className="flex flex-col gap-3">
            {confirmedBookings.map((booking) => (
              <BookingItem
                key={booking.id}
                serviceName={booking.service.name}
                barberShopName={booking.barbershop.name}
                barberShopImageUrl={booking.barbershop.imageUrl}
                date={booking.date}
                cancelled={booking.cancelled ?? false}
                onClick={() => handleBookingClick(booking)}
              />
            ))}
          </div>
        </div>
      )}

      {finishedBookings.length > 0 && (
        <div>
          <h2 className="text-muted-foreground mb-3 text-xs font-bold uppercase">
            Finalizados
          </h2>
          <div className="flex flex-col gap-3">
            {finishedBookings.map((booking) => (
              <BookingItem
                key={booking.id}
                serviceName={booking.service.name}
                barberShopName={booking.barbershop.name}
                barberShopImageUrl={booking.barbershop.imageUrl}
                date={booking.date}
                cancelled={booking.cancelled ?? false}
              />
            ))}
          </div>
        </div>
      )}

      {selectedBooking && (
        <CancelBookingSheet
          booking={selectedBooking}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      )}
    </>
  );
}
