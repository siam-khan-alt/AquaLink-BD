export interface ChatMessage {
  _id: string;
  chatId: string;
  sender: string;
  text: string;
  createdAt: Date;
}

export interface Chat {
  _id: string;
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: string;
  participants: string[];
  isAdminSupport: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface Contact {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  role: "farmer" | "expert" | "business" | "admin";
  isOnline?: boolean;
}

export type ChatTab = "direct" | "groups" | "support";
