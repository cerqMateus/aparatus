"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/app/_components/ui/sheet";
import { Button } from "@/app/_components/ui/button";
import { Card } from "@/app/_components/ui/card";
import { Avatar, AvatarImage } from "@/app/_components/ui/avatar";
import { Badge } from "@/app/_components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import ContactItem from "./contact-item";
import {
  Booking,
  BarbershopService,
  Barbershop,
} from "../generated/prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";
import { cancelBooking } from "../_actions/cancel-booking";
import { toast } from "sonner";
import Image from "next/image";
import { MapPinIcon } from "lucide-react";
import { useState } from "react";

interface CancelBookingSheetProps {
  booking: Booking & {
    service: BarbershopService;
    barbershop: Barbershop;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function CancelBookingSheet({
  booking,
  open,
  onOpenChange,
}: CancelBookingSheetProps) {
  const { executeAsync, isPending } = useAction(cancelBooking);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const now = new Date();
  const isFinished = booking.cancelled || booking.date <= now;

  const handleCancelClick = () => {
    setShowAlertDialog(true);
  };

  const handleConfirmCancel = async () => {
    const result = await executeAsync({
      bookingId: booking.id,
    });

    if (result?.data) {
      toast.success("Reserva cancelada com sucesso!");
      setShowAlertDialog(false);
      onOpenChange(false);
    } else if (result?.serverError) {
      toast.error(result.serverError);
    } else {
      toast.error("Erro ao cancelar reserva. Tente novamente.");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-96 overflow-y-auto px-0 sm:max-w-md"
      >
        <SheetHeader className="border-border border-b px-5 pt-5 pb-6 text-left">
          <SheetTitle>Informações da Reserva</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 py-6">
          {/* Map with Barbershop Card Overlay */}
          <div className="relative h-[180px] w-full">
            <Image
              src="/map.png"
              alt="Localização"
              fill
              className="rounded-lg object-cover"
            />

            {/* Barbershop Card */}
            <div className="absolute right-4 bottom-4 left-4">
              <Card className="flex flex-col gap-4 p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={booking.barbershop.imageUrl} />
                  </Avatar>
                  <div className="flex flex-col">
                    <h3 className="font-bold">{booking.barbershop.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <MapPinIcon className="text-primary h-4 w-4" />
                      <p className="text-muted-foreground text-xs">
                        {booking.barbershop.address}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Badge Status */}
          <Badge
            variant={isFinished ? "secondary" : "default"}
            className="w-fit"
          >
            {booking.cancelled
              ? "Cancelado"
              : booking.date <= now
                ? "Finalizado"
                : "Confirmado"}
          </Badge>

          {/* Service and Date Info Card */}
          <Card className="bg-secondary flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                {booking.service.name}
              </span>
              <span className="text-sm font-bold">
                {currency.format(
                  Math.floor(booking.service.priceInCents / 100),
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Data</span>
              <span className="text-sm">
                {format(booking.date, "dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Horário</span>
              <span className="text-sm">{format(booking.date, "HH:mm")}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Barbearia</span>
              <span className="text-sm">{booking.barbershop.name}</span>
            </div>
          </Card>

          {/* Contact Section */}
          {booking.barbershop.phones.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-muted-foreground text-xs font-bold uppercase">
                Contato
              </h3>
              <div className="flex flex-col">
                {booking.barbershop.phones.map((phone) => (
                  <ContactItem key={phone} phone={phone} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons - Only show for confirmed bookings */}
        {!isFinished && (
          <SheetFooter className="border-border border-t px-5 pt-6 pb-6">
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                size="sm"
                className="w-32 rounded-full"
              >
                Voltar
              </Button>
              <Button
                onClick={handleCancelClick}
                disabled={isPending}
                variant="destructive"
                size="sm"
                className="w-32 rounded-full"
              >
                Cancelar Reserva
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>

      <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta reserva? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Cancelando..." : "Sim, cancelar reserva"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
