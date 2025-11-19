"use client";

import { useState } from "react";
import { Calendar } from "@/app/_components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/app/_components/ui/sheet";
import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import { BarbershopService, Barbershop } from "../generated/prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";
import { createBooking } from "../_actions/create-booking";
import { toast } from "sonner";

interface BookingSheetProps {
  service: BarbershopService;
  barbershop: Barbershop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function BookingSheet({
  service,
  barbershop,
  open,
  onOpenChange,
}: BookingSheetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  const { executeAsync, isPending } = useAction(createBooking);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;

    // Combine date and time
    const [hours, minutes] = selectedTime.split(":");
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const result = await executeAsync({
      serviceId: service.id,
      date: bookingDate,
    });

    if (result?.data) {
      toast.success("Reserva criada com sucesso!");
      // Reset and close
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      onOpenChange(false);
    } else if (result?.serverError) {
      toast.error(result.serverError);
    } else {
      toast.error("Erro ao criar reserva. Tente novamente.");
    }
  };

  const isConfirmDisabled = !selectedDate || !selectedTime || isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96 overflow-y-auto px-0">
        <SheetHeader className="border-border border-b pb-4">
          <SheetTitle className="text-left">Fazer Reserva</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-5 py-6">
          {/* Calendar Section */}
          <div className="flex flex-col gap-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date()}
              className="w-full"
              locale={ptBR}
            />
          </div>

          {selectedDate && <Separator className="bg-muted" />}

          {/* Time Slots Section */}
          {selectedDate && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Horário</h3>
              <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                {TIME_SLOTS.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSelect(time)}
                    className="shrink-0 rounded-lg"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedDate && selectedTime && <Separator className="bg-muted" />}

          {/* Booking Summary */}
          {selectedDate && selectedTime && (
            <div className="border-border bg-card flex flex-col gap-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-md font-semibold">{service.name}</span>
                <span className="text-md font-semibold">
                  {currency.format(Math.floor(service.priceInCents / 100))}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Data</span>
                <span className="text-muted-foreground text-sm">
                  {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Horário</span>
                <span className="text-muted-foreground text-sm">
                  {selectedTime}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Barbearia</span>
                <span className="text-muted-foreground text-sm">
                  {barbershop.name}
                </span>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="border-border border-t pt-4">
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="w-full"
          >
            {isPending ? "Confirmando..." : "Confirmar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
