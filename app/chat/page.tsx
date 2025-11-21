"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import { Input } from "../_components/ui/input";
import { Button } from "../_components/ui/button";
import { MicIcon, SendIcon, ChevronLeftIcon } from "lucide-react";
import { ChatMessage } from "./_components/chat-message";
import Image from "next/image";
import Link from "next/link";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant" as const,
  parts: [
    {
      type: "text" as const,
      text: "Olá! Sou o Agenda.ai, seu assistente pessoal.\n\nEstou aqui para te auxiliar a agendar seu corte ou barba, encontrar as barbearias disponíveis perto de você e responder às suas dúvidas",
    },
  ],
  createdAt: new Date(),
};

export default function ChatPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    messages: [WELCOME_MESSAGE],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Custom Header for Chat */}
      <header className="flex items-center justify-between px-5 py-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <Image src="/logo.svg" alt="Aparatus" width={100} height={26.09} />
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      {/* Messages Container */}
      <div className="flex-1 space-y-4 overflow-y-auto py-6 [&::-webkit-scrollbar]:hidden">
        {messages.map((message) => {
          const content = message.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join("");

          return (
            <ChatMessage
              key={message.id}
              role={message.role as "user" | "assistant"}
              content={content}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-border bg-background border-t p-5">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            disabled
          >
            <MicIcon className="size-5" />
          </Button>
          <Button
            type="submit"
            size="icon"
            className="shrink-0"
            disabled={!input.trim()}
          >
            <SendIcon className="size-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
