import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const [value, setValue] = React.useState<string>("");

    return (
      <input
        type={type}
        className={cn(
          "flex w-full h-full rounded-md input-box-bg px-3 py-1 text-base shadow-sm transition-colors file:input-box-bg file:text-sm file:font-medium file:text-foreground placeholder:input-placeholder focus-visible:outline-none input-box disabled:cursor-not-allowed disabled:opacity-50 md:text-xs",
          value ? "border-green-500" : " border-none", // Add green border if value exists
          className
        )}
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)} // Update value on change
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
