import React from "react"
import ReactMarkdown from "react-markdown"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function AIMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-row items-end gap-2 p-2">
      <div className="self-end">
        <Avatar>
          <AvatarImage src="/bot.svg" alt="AI Avatar" width={8} height={8} />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      </div>
      <div className="bg-muted p-3 rounded-lg shadow text-sm text-left max-w-[80%]">
        <ReactMarkdown
          components={{
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 break-all whitespace-pre-wrap">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-gray-200 px-1 rounded break-all whitespace-pre-wrap">
                {children}
              </code>
            ),
            p: ({ children }) => (
              <p className="break-words whitespace-pre-wrap">{children}</p>
            ),
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
    </div>
  )
}
