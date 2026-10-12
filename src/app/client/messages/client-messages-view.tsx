"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Send, MessageSquare, Check, CheckCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

interface ClientMessagesViewProps {
  conversation: any;
  currentUserId: string;
  nutritionistName: string;
}

export function ClientMessagesView({
  conversation,
  currentUserId,
  nutritionistName,
}: ClientMessagesViewProps) {
  const router = useRouter();
  const [content, setContent] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const messages = conversation?.messages || [];

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          conversationId: conversation?.id,
        }),
      });

      if (res.ok) {
        setContent("");
        router.refresh();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Mensagens
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Canal direto com o teu nutricionista ({nutritionistName}).
        </p>
      </div>

      <Card className="flex flex-col h-[520px] bg-white border-slate-200">
        <CardHeader className="py-3 px-5 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            💬
          </div>
          <div>
            <CardTitle className="text-sm">{nutritionistName}</CardTitle>
            <p className="text-[11px] text-emerald-700 font-medium">Nutricionista Responsável</p>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <MessageSquare className="h-8 w-8 mb-2 opacity-50 text-emerald-600" />
              <p className="text-sm">Ainda não existem mensagens.</p>
              <p className="text-xs text-slate-400 mt-1">
                Envia uma mensagem ao teu nutricionista se tiveres dúvidas sobre as refeições.
              </p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isMe = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-3.5 rounded-2xl max-w-sm text-xs leading-relaxed ${
                      isMe
                        ? "bg-emerald-600 text-white rounded-br-xs"
                        : "bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-xs"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div
                      className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                        isMe ? "text-emerald-200" : "text-slate-400"
                      }`}
                    >
                      <span>{formatDateTime(msg.createdAt)}</span>
                      {isMe && (
                        <span>
                          {msg.isRead ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="p-3 border-t border-slate-100 bg-white">
          <form onSubmit={handleSend} className="flex items-center gap-2 w-full">
            <input
              type="text"
              placeholder="Escreve uma mensagem..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={sending}
              className="gap-1.5 h-10 px-4"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Enviar</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
