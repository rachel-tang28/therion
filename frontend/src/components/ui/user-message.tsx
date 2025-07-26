import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-row justify-end items-end gap-2 p-2 w-full">
      <div className="flex flex-row items-end gap-2 max-w-[80%]">
        <div className="user-message rounded-lg shadow text-sm text-left max-w-[80%]">
          <div className="ai-message-content">{message}</div>
        </div>
        <div className="self-end">
          <Avatar>
            <AvatarImage src="/user.svg" alt="User Avatar" />
            <AvatarFallback>User</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
