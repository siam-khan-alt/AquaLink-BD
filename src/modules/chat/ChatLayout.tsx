"use client";

import React, { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { MessageSquare, Users, HeadphonesIcon, Send, Plus, X, Search, Menu, Info, MoreVertical, ChevronLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { Chat, ChatMessage, ChatTab, User as UserType, Contact, FarmerChatTab, AdminChatTab } from "@/shared/types/chat";
import { cn } from "@/lib/utils";

export default function ChatLayout() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<ChatTab>("direct");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showFarmerSearch, setShowFarmerSearch] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<any>(null);

  // Role-based tab ordering
  const getTabsForRole = (): ChatTab[] => {
    if (session?.user?.role === "admin") {
      return ["support", "direct", "community"] as AdminChatTab[];
    }
    return ["direct", "community", "support"] as FarmerChatTab[];
  };

  const availableTabs = getTabsForRole();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // API calls with pagination
  const fetchChats = useCallback(async () => {
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
  }, [activeTab, session?.user?.id]);

  const fetchMessages = useCallback(async (chatId: string, pageNum: number = 1) => {
    if (!chatId) return;
    try {
      const limit = 50;
      const response = await fetch(`/api/chat/messages?chatId=${chatId}&page=${pageNum}&limit=${limit}`);
      const data = await response.json();
      if (data.messages) {
        if (pageNum === 1) {
          setMessages(data.messages);
        } else {
          setMessages((prev) => [...data.messages, ...prev]);
        }
        setHasMore(data.messages.length === limit);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  // Pusher connection with proper cleanup
  useEffect(() => {
    if (!selectedChat?._id) return;

    const initializePusher = async () => {
      try {
        const Pusher = (await import("pusher-js")).default;
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
        });

        const channel = pusher.subscribe(`private-chat-${selectedChat._id}`);
        
        const handleNewMessage = (newMessage: ChatMessage) => {
          startTransition(() => {
            setMessages((prev) => [...prev, newMessage]);
            setChats((prevChats) =>
              prevChats.map((chat) =>
                chat._id === newMessage.chatId
                  ? {
                      ...chat,
                      lastMessage: newMessage,
                      unreadCount: chat._id === selectedChat._id ? 0 : (chat.unreadCount || 0) + 1,
                      updatedAt: new Date(),
                    }
                  : chat
              )
            );
          });
        };

        channel.bind("new-message", handleNewMessage);
        pusherRef.current = { pusher, channel };
      } catch (error) {
        console.error("Pusher initialization error:", error);
      }
    };

    initializePusher();

    return () => {
      if (pusherRef.current) {
        const { pusher, channel } = pusherRef.current;
        channel.unbind("new-message");
        pusher.unsubscribe(`private-chat-${selectedChat._id}`);
        pusherRef.current = null;
      }
    };
  }, [selectedChat?._id]);

  // অটো স্ক্রোল ইফেক্ট
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // চ্যাট লিস্ট লোড করার ইফেক্ট
  useEffect(() => {
    let isMounted = true;
    
    const loadChats = async () => {
      if (isMounted) {
        await fetchChats();
      }
    };

    loadChats();

    return () => {
      isMounted = false;
    };
  }, [fetchChats]);

  // মেসেজ লোড করার ইফেক্ট
  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      if (selectedChat?._id && isMounted) {
        await fetchMessages(selectedChat._id);
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedChat?._id, fetchMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedChat) return;

    const messageText = input.trim();
    setInput("");

    // Optimistic UI update
    const optimisticMessage: ChatMessage = {
      _id: `temp-${Date.now()}`,
      chatId: selectedChat._id,
      sender: session?.user?.id || "",
      text: messageText,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChat._id,
          text: messageText,
        }),
      });

      if (!response.ok) {
        // Rollback optimistic update on failure
        setMessages((prev) => prev.filter((msg) => msg._id !== optimisticMessage._id));
        setInput(messageText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Rollback optimistic update on error
      setMessages((prev) => prev.filter((msg) => msg._id !== optimisticMessage._id));
      setInput(messageText);
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

  const handleSearchFarmers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/chat/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.contacts) {
        setSearchResults(data.contacts);
      }
    } catch (error) {
      console.error("Error searching farmers:", error);
    }
  };

  const handleStartFarmerDM = async (farmerId: string) => {
    try {
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isGroup: false,
          participants: [farmerId],
        }),
      });

      const data = await response.json();
      if (data.chat) {
        setSelectedChat(data.chat);
        setShowFarmerSearch(false);
        setSearchQuery("");
        setSearchResults([]);
        fetchChats();
      }
    } catch (error) {
      console.error("Error starting DM:", error);
    }
  };

  // Helper function to get participant name safely
  const getParticipantName = (participant: string | UserType): string => {
    if (typeof participant === 'string') return 'Unknown';
    return participant.name || 'Unknown';
  };

  // Helper function to check if participant is current user
  const isCurrentUser = (participant: string | UserType): boolean => {
    if (typeof participant === 'string') return participant === session?.user?.id;
    return participant._id === session?.user?.id;
  };

  // Helper function to get other participant for direct messages
  const getOtherParticipant = (chat: Chat): UserType | null => {
    if (chat.isGroup || chat.isAdminSupport) return null;
    const other = chat.participants.find(p => !isCurrentUser(p));
    return typeof other === 'string' ? null : (other || null);
  };

  if (!session || !session.user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <p className="text-[var(--text)]">Please log in to access chat</p>
      </div>
    );
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="flex h-screen bg-[var(--background)] relative overflow-hidden">
      
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 transition-opacity duration-200 ease-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile FAB for Sidebar Toggle */}
      {!sidebarOpen && isMobile && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-[var(--primary)] text-white rounded-full shadow-2xl hover:scale-105 transition-transform duration-200 ease-out"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Left Column: Chat List (300px on desktop, Glassmorphic Slide-Over on mobile) */}
      <div className={cn(
        "flex flex-col bg-[var(--surface)] border-r border-[var(--border)] z-50 transition-all duration-200 ease-out",
        isMobile 
          ? `fixed inset-y-0 left-0 w-[85%] max-w-xs rounded-r-2xl shadow-2xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
          : "w-[300px] relative"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--text)]">মৎস্য বন্ধু চ্যাট</h1>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
            >
              <X size={20} className="text-[var(--text)]" />
            </button>
          )}
        </div>

        {/* Role-Based Tab Navigation */}
        <div className="flex border-b border-[var(--border)]">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex-1 py-3 px-3 flex items-center justify-center gap-2 transition-colors ${
                activeTab === tab
                  ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                  : "text-[var(--text)] opacity-60 hover:opacity-100"
              }`}
            >
              {tab === "direct" && <MessageSquare size={16} />}
              {tab === "community" && <Users size={16} />}
              {tab === "support" && <HeadphonesIcon size={16} />}
              <span className="text-xs font-semibold capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-2 space-y-2">
          {activeTab === "direct" && (
            <button
              onClick={() => {
                setShowFarmerSearch(true);
                if (isMobile) setSidebarOpen(false);
              }}
              className="w-full p-2.5 bg-[var(--primary)] text-[#020617] rounded-lg flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              <Search size={16} />
              Search Farmers
            </button>
          )}

          {activeTab === "support" && !isAdmin && (
            <button
              onClick={handleCreateSupportChat}
              className="w-full p-2.5 bg-[var(--primary)] text-[#020617] rounded-lg flex items-center justify-center gap-2 font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              <HeadphonesIcon size={16} />
              Contact Support
            </button>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            return (
              <div
                key={chat._id}
                onClick={() => {
                  setSelectedChat(chat);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ease-out relative ${
                  selectedChat?._id === chat._id
                    ? "bg-[var(--primary)] text-[#020617] shadow-lg"
                    : "bg-[var(--background)] text-[var(--text)] hover:bg-[var(--border)]"
                }`}
              >
                <div className="font-semibold text-sm">
                  {chat.isGroup 
                    ? chat.groupName 
                    : otherParticipant?.name || "Unknown"
                  }
                </div>
                {chat.lastMessage && (
                  <div className="text-xs opacity-70 truncate mt-1">
                    {chat.lastMessage.text}
                  </div>
                )}
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Column: Chat Area (flex-1) */}
      <div className="flex-1 flex flex-col bg-[var(--background)]">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} className="text-[var(--text)]" />
                  </button>
                )}
                <div>
                  <h2 className="font-bold text-[var(--text)]">
                    {selectedChat.isGroup 
                      ? selectedChat.groupName 
                      : getOtherParticipant(selectedChat)?.name || "Unknown"
                    }
                  </h2>
                  <p className="text-xs text-[var(--text)] opacity-60">
                    {selectedChat.isGroup ? `${selectedChat.participants.length} members` : "Direct message"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isMobile && (
                  <button
                    onClick={() => setShowProfilePanel(!showProfilePanel)}
                    className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                  >
                    <Info size={20} className="text-[var(--text)]" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedChat(null)}
                  className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
                >
                  <X size={20} className="text-[var(--text)]" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender === session.user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      message.sender === session.user.id
                        ? "bg-[var(--primary)] text-[#020617]"
                        : "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-[10px] opacity-60 mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-200 ease-out"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className="p-3 bg-[var(--primary)] text-[#020617] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
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

      {/* Right Column: Profile Panel (260px, desktop only) */}
      {!isMobile && (
        <div className={cn(
          "w-[260px] border-l border-[var(--border)] bg-[var(--surface)] flex flex-col transition-all duration-200 ease-out",
          showProfilePanel ? "translate-x-0" : "-translate-x-0"
        )}>
          {selectedChat ? (
            <div className="p-4">
              <h3 className="font-bold text-[var(--text)] mb-4">Chat Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[var(--text)] opacity-60 mb-1">Chat Type</p>
                  <p className="text-sm text-[var(--text)] font-semibold">
                    {selectedChat.isGroup ? "Group Chat" : "Direct Message"}
                  </p>
                </div>

                {selectedChat.isGroup && (
                  <div>
                    <p className="text-xs text-[var(--text)] opacity-60 mb-1">Members</p>
                    <p className="text-sm text-[var(--text)] font-semibold">
                      {selectedChat.participants.length}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-[var(--text)] opacity-60 mb-1">Created</p>
                  <p className="text-sm text-[var(--text)]">
                    {new Date(selectedChat.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {selectedChat.isPublic && (
                  <div>
                    <p className="text-xs text-[var(--text)] opacity-60 mb-1">Community</p>
                    <p className="text-sm text-[var(--text)] font-semibold">Public Channel</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[var(--text)] opacity-40 text-sm">Select a chat to view details</p>
            </div>
          )}
        </div>
      )}

      {/* Farmer Search Modal */}
      {showFarmerSearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-md border border-[var(--border)] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--text)]">Search Farmers</h2>
              <button
                onClick={() => {
                  setShowFarmerSearch(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="p-2 hover:bg-[var(--border)] rounded-lg transition-colors"
              >
                <X size={20} className="text-[var(--text)]" />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <button
                onClick={handleSearchFarmers}
                className="p-3 bg-[var(--primary)] text-[#020617] rounded-xl hover:opacity-90 transition-opacity"
              >
                <Search size={20} />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchResults.map((contact) => (
                <div
                  key={contact._id}
                  onClick={() => handleStartFarmerDM(contact._id)}
                  className="p-3 bg-[var(--background)] rounded-xl cursor-pointer hover:bg-[var(--border)] transition-colors"
                >
                  <div className="font-semibold text-[var(--text)]">{contact.name}</div>
                  <div className="text-sm text-[var(--text)] opacity-60">{contact.role}</div>
                </div>
              ))}
              {searchResults.length === 0 && searchQuery && (
                <p className="text-center text-[var(--text)] opacity-60">No farmers found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-md border border-[var(--border)] shadow-2xl">
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
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="mb-4">
              <p className="text-sm text-[var(--text)] opacity-60 mb-2">Add participants (minimum 2)</p>
              <input
                placeholder="Enter user IDs (comma separated)"
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                onChange={(e) => setSelectedParticipants(e.target.value.split(",").map(id => id.trim()).filter(Boolean))}
              />
            </div>
            <button
              onClick={handleCreateGroup}
              disabled={!groupName.trim() || selectedParticipants.length < 2}
              className="w-full p-3 bg-[var(--primary)] text-[#020617] rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Create Group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}