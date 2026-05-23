// User/Participant types (supports both raw IDs and populated objects)
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  role: "farmer" | "admin";
  isOnline?: boolean;
}

export type Participant = string | User;

// Message types
export interface ChatMessage {
  _id: string;
  chatId: string;
  sender: string;
  senderName?: string; // Populated for display
  text: string;
  createdAt: Date;
}

// Chat types with role-based support
export type ChatType = "direct" | "group" | "support" | "community";

export interface Chat {
  _id: string;
  type: ChatType;
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: string | User;
  participants: Participant[];
  isAdminSupport: boolean;
  isPublic?: boolean; // For community channels
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  memberCount?: number; // For community channels
}

// Contact for farmer search
export interface Contact {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  role: "farmer" | "admin";
  isOnline?: boolean;
}

// Role-specific tabs
export type FarmerChatTab = "direct" | "community" | "support";
export type AdminChatTab = "direct" | "support" | "community";
export type ChatTab = FarmerChatTab | AdminChatTab;

// Community channel type
export interface CommunityChannel {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  isPublic: boolean;
  createdAt: Date;
}
