import Header from "../_components/header";
import Footer from "../_components/footer";
import SearchInput from "../_components/search-input";
import BarberShopItem from "../_components/barbershop-item";
import { prisma } from "@/lib/prisma";
import { PageSection, PageSectionTitle } from "../_components/ui/page";

interface BarbershopsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

const BarbershopsPage = async (props: BarbershopsPageProps) => {
  const searchParams = await props.searchParams;
  const searchValue = searchParams.search || "";

  const barbershops = searchValue
    ? await prisma.barbershop.findMany({
        where: {
          services: {
            some: {
              name: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      })
    : [];

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 space-y-6 p-5">
        <SearchInput />

        {searchValue && (
          <PageSection>
            <PageSectionTitle>
              Resultados para &quot;{searchValue}&quot;
            </PageSectionTitle>

            {barbershops.length > 0 ? (
              <div className="flex flex-col gap-4">
                {barbershops.map((barbershop) => (
                  <BarberShopItem key={barbershop.id} barbershop={barbershop} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  Nenhuma barbearia encontrada para &quot;{searchValue}&quot;
                </p>
              </div>
            )}
          </PageSection>
        )}
      </div>
      <Footer />
    </main>
  );
};

export default BarbershopsPage;
