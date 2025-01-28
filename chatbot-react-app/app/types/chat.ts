export interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatState {
  messages: Message[]
  documentLoaded: boolean
  currentDocument: string | null
}

export interface ApiResponse {
  success: boolean
  message?: string
  response?: {
    role: "assistant"
    content: string
  }
}


