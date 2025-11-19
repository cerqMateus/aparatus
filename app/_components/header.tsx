"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { LogInIcon, MenuIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const Header = () => {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  return (
    <header className="flex items-center justify-between px-5 py-6">
      <Image src="/logo.svg" alt="Aparatus" width={100} height={26.09} />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleLogin}>
          <LogInIcon />
        </Button>
        <Button variant="outline" size="icon">
          <MenuIcon />
        </Button>
      </div>
    </header>
  );
};

export default Header;
