"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { MenuIcon } from "lucide-react";
import SidebarMenu from "./sidebar-menu";
import { useState } from "react";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between px-5 py-6">
        <Image src="/logo.svg" alt="Aparatus" width={100} height={26.09} />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </Button>
        </div>
      </header>
      <SidebarMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
};

export default Header;
