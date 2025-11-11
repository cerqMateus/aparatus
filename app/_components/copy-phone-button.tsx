"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";

interface CopyPhoneButtonProps {
  phone: string;
}

export default function CopyPhoneButton({ phone }: CopyPhoneButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      aria-live="polite"
      className="rounded-2xl font-semibold"
    >
      {copied ? "Copiado" : "Copiar"}
    </Button>
  );
}
