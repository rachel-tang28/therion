import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full h-full rounded-md border border-input input-box-bg px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:input-box-bg file:text-sm file:font-medium file:text-foreground placeholder:input-placeholder focus-visible:outline-none input-box disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
