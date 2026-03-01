'use client';

import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, MoreVertical, Phone, Video, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const conversations = [
  {
    id: "1",
    name: "Coach Michael O.",
    avatar: "👨‍🏫",
    lastMessage: "Great progress this week! Keep it up 💪",
    time: "2 mins ago",
    unread: 2,
    isCoach: true,
  },
  {
    id: "2",
    name: "Sarah M.",
    avatar: "🏃‍♀️",
    lastMessage: "Want to do a morning run together tomorrow?",
    time: "1 hour ago",
    unread: 0,
    isCoach: false,
  },
  {
    id: "3",
    name: "Fitness Accountability Group",
    avatar: "👥",
    lastMessage: "James: Just finished my workout!",
    time: "3 hours ago",
    unread: 15,
    isCoach: false,
  },
];

const messages = [
  {
    id: "1",
    sender: "coach",
    text: "Hey! How did your workout go today?",
    time: "10:30 AM",
  },
  {
    id: "2",
    sender: "me",
    text: "It was great! Did legs today 🦵",
    time: "10:32 AM",
  },
  {
    id: "3",
    sender: "coach",
    text: "Awesome! Remember to stretch properly after leg day. It really helps with recovery.",
    time: "10:33 AM",
  },
  {
    id: "4",
    sender: "me",
    text: "Will do! Thanks for the reminder 😊",
    time: "10:35 AM",
  },
  {
    id: "5",
    sender: "coach",
    text: "Great progress this week! Keep it up 💪",
    time: "10:36 AM",
  },
];

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>("1");
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <Layout>
      <div className="container py-6 md:py-8 max-w-6xl">
        <div className="grid md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-180px)] md:h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className={cn(
            "flex flex-col",
            selectedChat && "hidden md:flex"
          )}>
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
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedChat(conversation.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 hover:bg-muted transition-colors text-left",
                    selectedChat === conversation.id && "bg-muted"
                  )}
                >
                  <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center text-2xl shrink-0">
                    {conversation.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold truncate">
                        {conversation.name}
                        {conversation.isCoach && (
                          <span className="text-primary text-xs ml-1">Coach</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {conversation.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat View */}
          <Card className={cn(
            "flex flex-col",
            !selectedChat && "hidden md:flex"
          )}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-xl">
                    {selectedConversation.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{selectedConversation.name}</h3>
                    <p className="text-xs text-muted-foreground">Active now</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon">
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === "me" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] px-4 py-2 rounded-2xl",
                          message.sender === "me"
                            ? "gradient-hero text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        )}
                      >
                        <p>{message.text}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          message.sender === "me" 
                            ? "text-primary-foreground/70" 
                            : "text-muted-foreground"
                        )}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newMessage.trim()) {
                          // Handle send
                          setNewMessage("");
                        }
                      }}
                    />
                    <Button 
                      variant="hero" 
                      size="icon"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-5 h-5" />
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
                    Choose a chat from the list to start messaging
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
