import { z } from "zod";

const userSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  role: z.enum(["farmer", "admin", "doctor"]),
});

const messageSchema = z.object({
  _id: z.string(),
  chatId: z.string(),
  sender: z.string(),
  text: z.string(),
  createdAt: z.union([z.string(), z.date()]),
});

const chatSchema = z.object({
  _id: z.string(),
  isGroup: z.boolean(),
  isAdminSupport: z.boolean(),
  groupName: z.string().optional(),
  participants: z.array(z.union([z.string(), userSchema])),
  groupAdmin: z.union([z.string(), userSchema]).optional(),
  lastMessage: messageSchema.optional(),
  unreadCount: z.number().optional(),
  isPublic: z.boolean().optional(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
});

export const chatResponseSchema = z.array(chatSchema);
export const chatSchemaValidation = chatSchema;
export const messageSchemaValidation = messageSchema;
