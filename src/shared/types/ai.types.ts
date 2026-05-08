export type AIModelType = "gemini-3-flash-preview";

export interface IChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
}

export interface IAIResponse {
  text: string;      
  error?: string;    
  status?: number;   
}

export interface IAIState {
  isChatOpen: boolean;
  toggleChat: () => void; 
}