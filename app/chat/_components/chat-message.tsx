import { Streamdown } from "streamdown";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({
  role,
  content,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} px-5`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? (
          <p className="text-sm wrap-break-word whitespace-pre-wrap">
            {content}
          </p>
        ) : (
          <div className="prose prose-sm dark:prose-invert prose-p:my-2 prose-p:leading-relaxed prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4 prose-li:my-1 prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-bold prose-h2:text-base prose-h3:text-sm prose-strong:font-semibold prose-strong:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-a:text-primary prose-a:underline max-w-none text-sm leading-relaxed">
            <Streamdown>{content}</Streamdown>
          </div>
        )}
      </div>
    </div>
  );
}
