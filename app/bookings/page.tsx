import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Header from "../_components/header";
import Footer from "../_components/footer";
import BookingItem from "../_components/booking-item";
import { headers } from "next/headers";

const BookingsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      service: true,
      barbershop: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  const now = new Date();

  const confirmedBookings = bookings.filter(
    (booking) => booking.date > now && !booking.cancelled,
  );

  const finishedBookings = bookings.filter(
    (booking) => booking.date <= now || booking.cancelled,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-5 py-6">
        <h1 className="mb-6 text-xl font-bold">Agendamentos</h1>

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
      </main>

      <Footer />
    </div>
  );
};

export default BookingsPage;
