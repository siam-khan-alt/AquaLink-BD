"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Users, HeadphonesIcon, Send, Plus, X, MoreVertical } from "lucide-react";
import { useSession } from "next-auth/react";
import { Chat, ChatMessage, ChatTab } from "@/shared/types/chat";
import { usePusherClient } from "@/shared/hooks/usePusherClient";

export default function ChatLayout() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<ChatTab>("direct");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  usePusherClient(selectedChat?._id || "", (newMessage: ChatMessage) => {
    setMessages((prev) => [...prev, newMessage]);
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    fetchChats();
  }, [activeTab, session]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/chat/chats?type=${activeTab}`);
      const data = await response.json();
      if (data.chats) {
        setChats(data.chats);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?chatId=${chatId}`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedChat) return;

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChat._id,
          text: input.trim(),
        }),
      });

      if (response.ok) {
        setInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCreateSupportChat = async () => {
    try {
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAdminSupport: true,
        }),
      });

      const data = await response.json();
      if (data.chat) {
        setSelectedChat(data.chat);
        setActiveTab("support");
        fetchChats();
      }
    } catch (error) {
      console.error("Error creating support chat:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedParticipants.length < 2) return;

    try {
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isGroup: true,
          groupName: groupName.trim(),
          participants: selectedParticipants,
        }),
      });

      if (response.ok) {
        setShowCreateGroup(false);
        setGroupName("");
        setSelectedParticipants([]);
        fetchChats();
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleStartDirectMessage = async (participantId: string) => {
    try {
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isGroup: false,
          participants: [participantId],
        }),
      });

      const data = await response.json();
      if (data.chat) {
        setSelectedChat(data.chat);
        fetchChats();
      }
    } catch (error) {
      console.error("Error creating direct chat:", error);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <p className="text-[var(--text)]">Please log in to access chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <div className="w-80 border-r border-[var(--border)] flex flex-col bg-[var(--surface)]">
        <div className="p-4 border-b border-[var(--border)]">
          <h1 className="text-xl font-bold text-[var(--text)]">মৎস্য বন্ধু চ্যাট</h1>
        </div>

        <div className="flex border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab("direct")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === "direct"
                ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                : "text-[var(--text)] opacity-60 hover:opacity-100"
            }`}
          >
            <MessageSquare size={18} />
            <span className="text-sm font-semibold">Direct</span>
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === "groups"
                ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                : "text-[var(--text)] opacity-60 hover:opacity-100"
            }`}
          >
            <Users size={18} />
            <span className="text-sm font-semibold">Groups</span>
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
              activeTab === "support"
                ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                : "text-[var(--text)] opacity-60 hover:opacity-100"
            }`}
          >
            <HeadphonesIcon size={18} />
            <span className="text-sm font-semibold">Support</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === "groups" && (
            <button
              onClick={() => setShowCreateGroup(true)}
              className="w-full mb-4 p-3 bg-[var(--primary)] text-[#020617] rounded-lg flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={18} />
              Create Group
            </button>
          )}

          {activeTab === "support" && (
            <button
              onClick={handleCreateSupportChat}
              className="w-full mb-4 p-3 bg-[var(--primary)] text-[#020617] rounded-lg flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity"
            >
              <HeadphonesIcon size={18} />
              Contact Support
            </button>
          )}

          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat)}
              className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                selectedChat?._id === chat._id
                  ? "bg-[var(--primary)] text-[#020617]"
                  : "bg-[var(--background)] text-[var(--text)] hover:bg-[var(--border)]"
              }`}
            >
              <div className="font-semibold">
                {chat.isGroup ? chat.groupName : (chat.participants as any[]).find((p: any) => p._id !== session.user.id)?.name || "Unknown"}
              </div>
              {chat.lastMessage && (
                <div className="text-sm opacity-70 truncate">
                  {chat.lastMessage.text}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[var(--background)]">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[var(--text)]">
                  {selectedChat.isGroup ? selectedChat.groupName : (selectedChat.participants as any[]).find((p: any) => p._id !== session.user.id)?.name || "Unknown"}
                </h2>
                <p className="text-sm text-[var(--text)] opacity-60">
                  {selectedChat.isGroup ? `${selectedChat.participants.length} members` : "Direct message"}
                </p>
              </div>
              <button
                onClick={() => setSelectedChat(null)}
                className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
              >
                <X size={20} className="text-[var(--text)]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender === session.user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === session.user.id
                        ? "bg-[var(--primary)] text-[#020617]"
                        : "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className="p-3 bg-[var(--primary)] text-[#020617] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-4 text-[var(--text)] opacity-30" />
              <p className="text-[var(--text)] opacity-60">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] rounded-lg p-6 w-full max-w-md border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--text)]">Create Group</h2>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
              >
                <X size={20} className="text-[var(--text)]" />
              </button>
            </div>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text)] mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="mb-4">
              <p className="text-sm text-[var(--text)] opacity-60 mb-2">Add participants (minimum 2)</p>
              <input
                placeholder="Enter user IDs (comma separated)"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                onChange={(e) => setSelectedParticipants(e.target.value.split(",").map(id => id.trim()).filter(Boolean))}
              />
            </div>
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedParticipants.length < 2}
              className="w-full p-3 bg-[var(--primary)] text-[#020617] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Create Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
