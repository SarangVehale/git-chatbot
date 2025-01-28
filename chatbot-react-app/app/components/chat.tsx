"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { uploadDocument, sendMessage } from "@/lib/api"
import type { Message, ChatState } from "@/types/chat"

export default function Chat() {
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<ChatState>({
    messages: [],
    documentLoaded: false,
    currentDocument: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [state.messages])

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)

    try {
      const result = await uploadDocument(file)
      if (result.success) {
        setState((prev) => ({
          ...prev,
          documentLoaded: true,
          currentDocument: file.name,
        }))
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!state.documentLoaded) {
      toast({
        title: "Error",
        description: "Please upload a document first",
        variant: "destructive",
      })
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const message = formData.get("message") as string

    if (!message.trim()) return

    setIsLoading(true)
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, { role: "user", content: message }],
    }))

    try {
      const result = await sendMessage(message)
      if (result.success && result.response) {
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, result.response],
        }))
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      form.reset()
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Document Chat Assistant</span>
            <div className="flex items-center gap-2">
              {state.currentDocument && (
                <span className="text-sm text-muted-foreground">Current: {state.currentDocument}</span>
              )}
              <Button variant="outline" size="sm" disabled={isLoading}>
                <label className="flex items-center gap-2 cursor-pointer">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload Document
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".txt,.pdf,.csv,.xlsx,.docx,.pptx"
                  />
                </label>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] mb-4 border rounded-lg p-4" ref={scrollRef}>
            {state.messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 p-4 rounded-lg ${
                  message.role === "user" ? "bg-primary text-primary-foreground ml-12" : "bg-muted mr-12"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}
            {state.messages.length === 0 && (
              <div className="text-center text-muted-foreground p-4">
                {state.documentLoaded
                  ? "Upload complete. Ask me anything about the document!"
                  : "Upload a document to get started"}
              </div>
            )}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              name="message"
              placeholder={state.documentLoaded ? "Ask a question about the document..." : "Upload a document first"}
              disabled={!state.documentLoaded || isLoading}
            />
            <Button type="submit" disabled={!state.documentLoaded || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}


