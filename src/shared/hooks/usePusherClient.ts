"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { ChatMessage } from "@/shared/types/chat";

export function usePusherClient(chatId: string, onMessage: (message: ChatMessage) => void) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      console.warn("Pusher configuration missing");
      return;
    }

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusherClient.subscribe(`chat-${chatId}`);
    channel.bind("new-message", (data: ChatMessage) => {
      onMessage(data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusherClient.disconnect();
    };
  }, [chatId]);
}