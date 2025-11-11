import Image from "next/image";
import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { BarbershopService } from "../generated/prisma/client";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface ServiceItemProps {
  service: BarbershopService;
}

const ServiceItem = ({ service }: ServiceItemProps) => {
  return (
    <Card className="border-none p-0">
      <div className="flex items-center gap-4 p-4">
        <div className="relative h-27 w-27 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            className="object-cover"
            sizes="100px"
          />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <CardHeader className="px-0 py-0">
            <CardTitle className="text-base">{service.name}</CardTitle>
            {service.description && (
              <CardDescription className="line-clamp-2">
                {service.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex items-center justify-between px-0 py-0 pt-2">
            <p className="font-semibold">
              {currency.format(service.priceInCents / 100)}
            </p>
            <Button className="rounded-2xl" type="button">
              Reservar
            </Button>
          </CardContent>
        </div>
      </div>
    </Card>
  );
};

export default ServiceItem;
