import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Footer from "@/app/_components/footer";
import { Button } from "@/app/_components/ui/button";
import {
  PageContainer,
  PageSection,
  PageSectionTitle,
} from "@/app/_components/ui/page";
import ServiceItem from "../../_components/service-item";
import ContactItem from "../../_components/contact-item";
import { ArrowLeft } from "lucide-react";

const BarbershopPage = async (props: PageProps<"/barbershops/[id]">) => {
  const { id } = await props.params;
  const barbershop = await prisma.barbershop.findUnique({
    where: { id },
    include: { services: true },
  });

  if (!barbershop) return notFound();

  return (
    <main>
      {/* Banner */}
      <div className="relative h-72 w-full">
        <Image
          src={barbershop.imageUrl}
          alt={barbershop.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute top-0 left-0 p-4">
          <Button
            className="rounded-full"
            asChild
            variant="outline"
            size="icon"
          >
            <Link href="/" aria-label="Voltar para a página inicial">
              <ArrowLeft />
            </Link>
          </Button>
        </div>
      </div>

      <PageContainer>
        {/* Header info */}
        <PageSection>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold">{barbershop.name}</h1>
            <p className="text-muted-foreground text-sm">
              {barbershop.address}
            </p>
            <PageSectionTitle>Sobre nós</PageSectionTitle>
            {barbershop.description && (
              <p className="text-sm">{barbershop.description}</p>
            )}
          </div>
        </PageSection>

        {/* Services */}
        <PageSection>
          <PageSectionTitle>Serviços</PageSectionTitle>
          <div className="grid grid-cols-1 gap-4">
            {barbershop.services.map((service) => (
              <ServiceItem key={service.id} service={service} />
            ))}
          </div>
        </PageSection>
        <PageSection>
          <PageSectionTitle>Contato</PageSectionTitle>
          <div className="flex flex-col gap-3">
            {barbershop.phones?.length
              ? barbershop.phones.map((phone) => (
                  <ContactItem key={phone} phone={phone} />
                ))
              : null}
          </div>
        </PageSection>
      </PageContainer>

      <Footer />
    </main>
  );
};

export default BarbershopPage;
