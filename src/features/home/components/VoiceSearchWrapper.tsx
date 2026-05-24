"use client";

import dynamic from "next/dynamic";

const VoiceSearchGate = dynamic(() => import("./VoiceSearchGate"), {
  ssr: false,
  loading: () => <div className="h-48 w-full animate-pulse bg-gray-200 rounded-2xl" />
});

export default function VoiceSearchWrapper() {
  return <VoiceSearchGate />;
}