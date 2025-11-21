"use client";

import {
  SearchIcon,
  Scissors,
  User,
  Sparkles,
  Eye,
  Hand,
  Droplets,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const QUICK_SEARCH_OPTIONS = [
  { label: "Cabelo", icon: Scissors },
  { label: "Barba", icon: User },
  { label: "Acabamento", icon: Sparkles },
  { label: "Sobrancelha", icon: Eye },
  { label: "Massagem", icon: Hand },
  { label: "Hidratação", icon: Droplets },
];

const SearchInput = () => {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/barbershops?search=${encodeURIComponent(searchValue)}`);
    } else {
      router.push("/");
    }
  };

  const handleQuickSearch = (searchTerm: string) => {
    router.push(`/barbershops?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          type="text"
          placeholder="Pesquise serviços ou barbearias"
          className="border-border rounded-full"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <Button
          type="submit"
          variant="default"
          size="icon"
          className="rounded-full"
        >
          <SearchIcon />
        </Button>
      </form>

      <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {QUICK_SEARCH_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <Button
              key={option.label}
              variant="outline"
              size="sm"
              className="gap-2 rounded-full whitespace-nowrap"
              onClick={() => handleQuickSearch(option.label)}
            >
              <Icon size={16} />
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchInput;
