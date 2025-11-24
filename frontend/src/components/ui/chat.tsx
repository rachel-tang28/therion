import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { BotMessageSquare, X, Send } from "lucide-react"
import AIMessage from "@/components/ui/ai-message"
import UserMessage from "@/components/ui/user-message"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Message {
  role: "user" | "ai"
  content: string
}

export function Chat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)

  // Retrieve messages from backend
  useEffect(() => {
    fetchMessages()
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const fetchMessages = async () => {
    try {
          const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'chat_messages/';
          const response = await fetch(endpoint, {
              method: "GET",
              headers: {
                  'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
              }
          });

          if (response.ok) {
              const data = await response.json();
              setMessages(data.messages || []);
          } else {
              console.error("Failed to get messages.");
              const errorData = await response.json();
              console.error("Failed to get messages:", errorData.detail);
              alert("Error: " + errorData.detail);
          }
      } catch (error) {
          console.error(error);
      }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = event.currentTarget.elements.namedItem("message") as HTMLInputElement
    const messageContent = input.value.trim()

    if (!messageContent) return
    setLoading(true)

    // Add user message to state
    setMessages((prev) => [...prev, { role: "user", content: messageContent }])
    input.value = ""

    // Send message to backend
    try {
      const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + 'chat_messages/';
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: "user", content: messageContent }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [...prev, { role: "ai", content: data.response }])
        fetchMessages() // Refresh messages after sending
        setLoading(false)
      } else {
        console.error("Failed to send message.")
        const errorData = await response.json()
        console.error("Failed to send message:", errorData.detail)
        alert("Error: " + errorData.detail)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="fixed bottom-6 right-[36px] z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className="chat-button"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
          >
            <BotMessageSquare className="mr-2" />
            <span>AI Chat</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="chat-window flex flex-col w-80 h-96 p-0"
          side="top"
          align="end"
        >
          <div className="chat-header flex items-center justify-between px-4 py-2 border-b">
            <h1 className="chat-title text-lg font-semibold">AI Chat</h1>
            <Button
              className="chat-close-button"
              variant="ghost"
              size="icon"
              onClick={() => { setIsOpen(false); fetchMessages(); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-scroll p-4 space-y-2 w-full">
            {messages.map((message, index) => (
              message.role === "ai" ? (
                <AIMessage key={index} message={message.content} />
              ) : (
                <UserMessage key={index} message={message.content} />
              )
            ))}
            {loading && (
              <AIMessage message="Loading..." />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <TooltipProvider delayDuration={100}>
          <Tooltip>
              <TooltipTrigger asChild>
                      
                <form className="flex flex-row justify-between items-center border-t px-4 py-2 w-full gap-[8px]" onSubmit={handleSubmit}>
                  <Input name="message" placeholder="Type a message..." autoComplete="off" />
                  <Button type="submit" variant="ghost" size="icon">
                    <Send width={16} height={16} />
                  </Button>
                </form>
              </TooltipTrigger>

              <TooltipContent side="top">
              <p>
                  Ask questions about sequence analysis, pipeline steps, or troubleshooting!
              </p>
              </TooltipContent>
          </Tooltip>
          </TooltipProvider>
        </PopoverContent>
      </Popover>
    </div>
  )
}
