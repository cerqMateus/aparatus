import Image from "next/image";
import Header from "./_components/header";
import SearchInput from "./_components/search-input";
import banner from "../public/banner.png";
import BookingItem from "./_components/booking-item";
import { prisma } from "@/lib/prisma";
import BarberShopItem from "./_components/barbershop-item";
import Footer from "./_components/footer";
import {
  PageSectionTitle,
  PageContainer,
  PageSection,
  PageSectionScroller,
} from "./_components/ui/page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  // Buscar sessão do usuário
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Buscar o agendamento finalizado mais recente do usuário
  let recentBooking = null;
  if (session?.user) {
    recentBooking = await prisma.booking.findFirst({
      where: {
        userId: session.user.id,
        date: {
          lte: new Date(), // Data menor ou igual a agora (finalizados)
        },
      },
      orderBy: {
        date: "desc", // Mais recente primeiro
      },
      include: {
        service: true,
        barbershop: true,
      },
    });
  }

  const recommendedBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const popularBarbershops = await prisma.barbershop.findMany({
    orderBy: {
      name: "desc",
    },
  });
  return (
    <main>
      <Header />
      <PageContainer>
        <SearchInput />
        <Image
          src={banner}
          alt="Agende agora"
          sizes="100vw"
          className="h-auto w-full"
        />
        <PageSection>
          <PageSectionTitle>Agendamentos</PageSectionTitle>
          {recentBooking ? (
            <BookingItem
              serviceName={recentBooking.service.name}
              barberShopName={recentBooking.barbershop.name}
              barberShopImageUrl={recentBooking.barbershop.imageUrl}
              date={recentBooking.date}
              cancelled={recentBooking.cancelled ?? false}
            />
          ) : (
            <p className="text-sm text-gray-400">
              Você ainda não tem agendamentos
            </p>
          )}
        </PageSection>
        <PageSection>
          <PageSectionTitle>Recomendados</PageSectionTitle>
          <PageSectionScroller>
            {recommendedBarbershops.map((barbershop) => (
              <BarberShopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageSectionScroller>
        </PageSection>
        <PageSection>
          <PageSectionTitle>Populares</PageSectionTitle>
          <PageSectionScroller>
            {popularBarbershops.map((barbershop) => (
              <BarberShopItem key={barbershop.id} barbershop={barbershop} />
            ))}
          </PageSectionScroller>
        </PageSection>
      </PageContainer>
      <Footer />
    </main>
  );
}
