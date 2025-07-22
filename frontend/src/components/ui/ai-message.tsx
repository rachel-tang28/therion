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
      <div className="ai-message items-center h-full flex flex-col justify-center">
        {message}
      </div>
    </div>
  );
}
