"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { HomeIcon, CalendarIcon, LogOutIcon, LogInIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Session {
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

const SidebarMenu = ({ open, onOpenChange }: SidebarMenuProps) => {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await authClient.getSession();
      setSession(data as Session | null);
    };
    fetchSession();
  }, []);

  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  const handleLogout = async () => {
    await authClient.signOut();
    setSession(null);
    router.refresh();
    onOpenChange(false);
  };

  const categories = [
    "Cabelo",
    "Barba",
    "Acabamento",
    "Sobrancelha",
    "Massagem",
    "Hidratação",
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p w-96">
        {session ? (
          <>
            {/* Menu Title */}
            <div className="border-border border-b px-2 py-6">
              <h2 className="text-muted-foreground text-xs font-semibold uppercase">
                Menu
              </h2>
            </div>

            {/* Logged In Header */}
            <SheetHeader className="border-border border-b px-2 py-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={session.user.image} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {session.user.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <SheetTitle className="text-base">
                    {session.user.name}
                  </SheetTitle>
                  <p className="text-muted-foreground text-xs">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </SheetHeader>

            {/* Navigation */}
            <div className="border-border flex flex-col gap-2 border-b px-2 py-3">
              <Button
                variant="ghost"
                className="justify-start gap-3"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link href="/">
                  <HomeIcon className="size-5" />
                  Início
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start gap-3"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link href="/bookings">
                  <CalendarIcon className="size-5" />
                  Agendamentos
                </Link>
              </Button>
            </div>

            {/* Categories */}
            <div className="border-border flex flex-col gap-2 border-b px-2 py-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    // TODO: Implement category filter
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Logout */}
            <div className="px-2 py-3">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={handleLogout}
              >
                <LogOutIcon className="text-muted-foreground size-5" />
                Sair da conta
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Logged Out State */}
            <SheetHeader className="border-border border-b px-5 py-6">
              <SheetTitle>Olá, faça seu login!</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-5 py-3">
              <Button
                variant="default"
                className="w-full justify-center gap-2"
                onClick={handleLogin}
              >
                <LogInIcon className="size-5" />
                Fazer Login
              </Button>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  asChild
                  onClick={() => onOpenChange(false)}
                >
                  <Link href="/">
                    <HomeIcon className="size-5" />
                    Início
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  asChild
                  onClick={() => onOpenChange(false)}
                >
                  <Link href="/bookings">
                    <CalendarIcon className="size-5" />
                    Agendamentos
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
