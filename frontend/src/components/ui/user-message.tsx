import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-row items-end gap-2 p-2">
      <div className="user-message">
        <div className="ai-message-content">{message}</div>
      </div>
      <div className="self-end">
        <Avatar>
          <AvatarImage src="/user.svg" alt="User Avatar" width={8} height={8} />
          <AvatarFallback>User</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
