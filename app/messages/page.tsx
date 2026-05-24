'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, ArrowLeft, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";

interface Conversation {
  id: string;
  user_id: string;
  trainer_id: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_user: number;
  unread_trainer: number;
  trainer: { id: string; full_name: string; avatar_url: string | null; user_id: string; last_seen_at?: string | null } | null;
  user_profile: { id: string; full_name: string; avatar_url: string | null; last_seen_at?: string | null } | null;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  seen_at?: string | null;
  sender: { full_name: string; avatar_url: string | null; last_seen_at?: string | null } | null;
}

function Avatar({ url, name, size = "md" }: { url: string | null; name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const cls = size === "sm"
    ? "w-10 h-10 rounded-full text-sm"
    : "w-12 h-12 rounded-full text-base";

  if (url) return <img src={url} alt={name} className={`${cls} object-cover shrink-0`} />;
  return (
    <div className={`${cls} gradient-hero flex items-center justify-center font-bold text-primary-foreground shrink-0`}>
      {initials}
    </div>
  );
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDayDivider(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMM d");
}

function formatPresence(iso: string | null | undefined) {
  if (!iso) return "Last active unknown";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes <= 2) return "Online now";
  if (diffMinutes < 60) return `Last active ${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Last active ${diffHours}h ago`;
  return `Last active ${date.toLocaleDateString()}`;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("conversation");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConvId);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.status === 401) return; // not logged in
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Could not load conversations");
      }
      const convs: Conversation[] = data.conversations ?? [];
      setConversations(convs);

      // Auto-select first conversation if none is currently selected
      if (convs.length > 0) {
        setSelectedConvId((prev) => prev ?? convs[0].id);
      }
    } catch (error: any) {
      toast.error(error?.message || "Could not load conversations");
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoadingMsgs(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Could not load messages");
      }
      setMessages(data?.messages ?? []);
      fetchConversations();
    } catch (error: any) {
      setMessages([]);
      setLoadError(error?.message || "Could not load messages");
    } finally {
      setLoadingMsgs(false);
    }
  }, [fetchConversations]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    fetchMessages(selectedConvId).catch(() => {});

    // Real-time subscription for new messages
    const channel = supabase
      .channel(`messages:${selectedConvId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConvId}`,
        },
        async (payload) => {
          if (!cancelled) {
            const incomingSender = (payload.new as { sender_id?: string }).sender_id;
            if (incomingSender === currentUserId) {
              fetchConversations();
              return;
            }
            await fetchMessages(selectedConvId);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${selectedConvId}`,
        },
        () => {
          if (!cancelled) fetchConversations();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [selectedConvId, currentUserId, fetchConversations, fetchMessages, supabase]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`conversation-list:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchConversations, supabase]);

  useEffect(() => {
    if (!currentUserId) return;

    const markSeen = () => {
      supabase.from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", currentUserId);
    };

    markSeen();
    const interval = window.setInterval(markSeen, 60000);
    const onFocus = () => markSeen();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [currentUserId, supabase]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId || sending) return;

    setSending(true);
    const text = newMessage.trim();
    const optimisticId = `temp-${Date.now()}`;
    setNewMessage("");
    setMessages((prev) => [
      ...prev,
      {
        id: optimisticId,
        conversation_id: selectedConvId,
        sender_id: currentUserId ?? "me",
        content: text,
        created_at: new Date().toISOString(),
        sender: null,
      },
    ]);

    try {
      const res = await fetch(`/api/conversations/${selectedConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (res.status === 401) {
        toast.error("Please sign in to send messages");
        setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
        setNewMessage(text);
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
        toast.error(data.error || "Failed to send");
        setNewMessage(text); // restore
        return;
      }
      if (data?.message) {
        setMessages((prev) => prev.map((message) => (
          message.id === optimisticId ? data.message as Message : message
        )));
      } else {
        setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
        await fetchMessages(selectedConvId);
      }
      fetchConversations();
    } catch {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
      toast.error("Failed to send message");
      setNewMessage(text);
    } finally {
      setSending(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const selectedOtherParty = selectedConv ? getOtherParty(selectedConv) : null;
  const lastSeenOwnMessageId = [...messages].reverse().find((msg) => msg.sender_id === currentUserId && msg.seen_at)?.id;

  function getOtherParty(conv: Conversation) {
    if (!currentUserId) return { name: "Unknown", avatar_url: null };
    const isTrainer = conv.trainer_id === currentUserId;
    if (isTrainer) {
      return {
        name: conv.user_profile?.full_name ?? "User",
        avatar_url: conv.user_profile?.avatar_url ?? null,
        last_seen_at: conv.user_profile?.last_seen_at ?? null,
      };
    }
    return {
      name: conv.trainer?.full_name ?? "Trainer",
      avatar_url: conv.trainer?.avatar_url ?? null,
      last_seen_at: conv.trainer?.last_seen_at ?? null,
    };
  }

  function getUnreadCount(conv: Conversation) {
    if (!currentUserId) return 0;
    return conv.trainer_id === currentUserId ? conv.unread_trainer : conv.unread_user;
  }

  function isCoach(conv: Conversation) {
    return conv.trainer_id !== currentUserId;
  }

  const filteredConvs = conversations.filter((c) => {
    if (!search) return true;
    const other = getOtherParty(c);
    return other.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Layout>
      <div className="container py-6 md:py-8 max-w-6xl">
        <div className="grid md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-230px)] md:h-[calc(100vh-200px)]">

          {/* Conversations List */}
          <Card className={cn("flex flex-col", selectedConvId && "hidden md:flex")}>
            <div className="p-4 border-b border-border">
              <h2 className="font-bold text-lg mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}

              {!loadingConvs && filteredConvs.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium mb-1">No conversations yet</p>
                  <p className="text-sm">
                    Browse{" "}
                    <Link href="/trainers" className="text-primary hover:underline">
                      trainers
                    </Link>{" "}
                    and send a message to get started.
                  </p>
                </div>
              )}

              {!loadingConvs && filteredConvs.length > 0 && selectedConvId && !filteredConvs.some((conv) => conv.id === selectedConvId) && (
                <div className="text-center p-6 text-sm text-muted-foreground">
                  The selected conversation is no longer available.
                </div>
              )}

              {filteredConvs.map((conv) => {
                const other = getOtherParty(conv);
                const unread = getUnreadCount(conv);
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors text-left",
                      selectedConvId === conv.id && "bg-muted"
                    )}
                  >
                    <Avatar url={other.avatar_url} name={other.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold truncate">
                          {other.name}
                          {isCoach(conv) && (
                            <span className="text-primary text-xs ml-1">Coach</span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message ?? "Start the conversation"}
                        </p>
                        {unread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Chat View */}
          <Card className={cn("flex flex-col", !selectedConvId && "hidden md:flex")}>
            {loadingConvs && selectedConvId ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : selectedConv ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <button
                    onClick={() => setSelectedConvId(null)}
                    className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  {selectedOtherParty && (
                    <>
                      <Avatar url={selectedOtherParty.avatar_url} name={selectedOtherParty.name} size="sm" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{selectedOtherParty.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {isCoach(selectedConv) ? "Coach · " : ""}
                          {formatPresence(selectedOtherParty.last_seen_at)}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMsgs && (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}

                  {!loadingMsgs && !loadError && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
                      <p>No messages yet. Say hello!</p>
                    </div>
                  )}

                  {!loadingMsgs && loadError && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
                      <p className="font-medium mb-2">{loadError}</p>
                      {selectedConvId && (
                        <Button variant="outline" size="sm" onClick={() => fetchMessages(selectedConvId)}>
                          Retry
                        </Button>
                      )}
                    </div>
                  )}

                  {!loadError && messages.map((msg, index) => {
                    const isMe = msg.sender_id === currentUserId;
                    const previousMessage = index > 0 ? messages[index - 1] : null;
                    const showDayDivider = !previousMessage || format(new Date(previousMessage.created_at), "yyyy-MM-dd") !== format(new Date(msg.created_at), "yyyy-MM-dd");
                    return (
                      <div key={msg.id}>
                        {showDayDivider && (
                          <div className="flex items-center justify-center my-4">
                            <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                              {formatDayDivider(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div
                          className={cn("flex", isMe ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] px-4 py-2 rounded-2xl",
                              isMe
                                ? "gradient-hero text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            <p>{msg.content}</p>
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}
                            >
                              {formatMessageTime(msg.created_at)}
                              {isMe && lastSeenOwnMessageId === msg.id && msg.seen_at ? " · Seen" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={sending}
                    />
                    <Button
                      variant="hero"
                      size="icon"
                      disabled={!newMessage.trim() || sending}
                      onClick={handleSend}
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="font-bold text-lg mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a chat from the list or{" "}
                    <Link href="/trainers" className="text-primary hover:underline">
                      find a trainer
                    </Link>{" "}
                    to message.
                  </p>
                </div>
              </div>
            )}
          </Card>

        </div>
      </div>
    </Layout>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    }>
      <MessagesContent />
    </Suspense>
  );
}
