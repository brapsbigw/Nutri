"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Send, MessageSquare, Search, CheckCheck, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/utils";

interface MessagesInboxViewProps {
  conversations: any[];
  currentUserId: string;
}

export function MessagesInboxView({
  conversations,
  currentUserId,
}: MessagesInboxViewProps) {
  const router = useRouter();
  const [selectedConvId, setSelectedConvId] = React.useState<string>(
    conversations[0]?.id || ""
  );
  const [content, setContent] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  const filteredConversations = conversations.filter((c) =>
    c.client.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedConvId) return;
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConvId,
          content,
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
    <div className="max-w-7xl mx-auto px-8 py-8">
      <Card className="h-[650px] flex overflow-hidden border-slate-200 bg-white">
        {/* Left Pane: Conversations List */}
        <div className="w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-2">Mensagens</h2>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar conversa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">
                Sem conversas encontradas.
              </p>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === selectedConvId;
                const lastMessage = c.messages[c.messages.length - 1];
                const unreadCount = c.messages.filter(
                  (m: any) => !m.isRead && m.senderId !== currentUserId
                ).length;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/80 border-l-4 border-emerald-600"
                        : "hover:bg-slate-100/60"
                    }`}
                  >
                    <Avatar name={c.client.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {c.client.name}
                        </span>
                        {unreadCount > 0 && (
                          <span className="h-4 min-w-4 px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {lastMessage ? lastMessage.content : "Início da conversa"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Messages Thread */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col justify-between h-full bg-white">
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <Avatar name={selectedConv.client.name} size="md" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedConv.client.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedConv.client.email || "Cliente Ativo"}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConv.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-50 text-emerald-600" />
                  <p className="text-xs">Ainda não existem mensagens com este cliente.</p>
                </div>
              ) : (
                selectedConv.messages.map((msg: any) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl max-w-md text-xs leading-relaxed ${
                          isMe
                            ? "bg-emerald-600 text-white rounded-br-xs"
                            : "bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200/80"
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
            </div>

            {/* Message Input Footer */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escrever resposta profissional ao cliente..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 h-10 px-3.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={sending}
                  className="h-10 px-5 gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Enviar</span>
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-sm">
            Seleciona uma conversa à esquerda.
          </div>
        )}
      </Card>
    </div>
  );
}
