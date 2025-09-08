import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex whitespace-nowrap items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
          confirmed:
              "border-transparent bg-emerald-500/60 text-emerald-900 hover:bg-success/80",
          pendingConfirmation:
              "border-transparent bg-yellow-500/60 text-yellow-800 hover:bg-success/80",
          pendingAuthorization:
                "border-transparent bg-violet-500/60 text-violet-800 hover:bg-success/80",
          cancelled:
              "border-transparent bg-red-700/70 text-red-950 hover:bg-success/80",
          closed:
              "border-transparent bg-sky-500/60 text-blue-800 hover:bg-success/80",
          interpreterRequested:
              "border-transparent bg-rose-500/20 text-pink-700 hover:bg-success/80",


      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
