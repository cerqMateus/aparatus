import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Header from "../_components/header";
import Footer from "../_components/footer";
import { BookingsList } from "../_components/bookings-list";
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-5 py-6">
        <h1 className="mb-6 text-xl font-bold">Agendamentos</h1>
        <BookingsList bookings={bookings} />
      </main>

      <Footer />
    </div>
  );
};

export default BookingsPage;
