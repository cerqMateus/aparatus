"use client";
import { Phone } from "lucide-react";
import CopyPhoneButton from "./copy-phone-button";

interface ContactItemProps {
  phone: string;
}

const ContactItem = ({ phone }: ContactItemProps) => {
  return (
    <div className="flex w-full items-center justify-between rounded-lg p-3">
      <div className="flex items-center gap-2">
        <Phone />
        <span className="text-sm">{phone}</span>
      </div>
      <CopyPhoneButton phone={phone} />
    </div>
  );
};

export default ContactItem;
