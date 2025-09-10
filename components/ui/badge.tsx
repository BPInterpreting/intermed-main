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
              "bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30 dark:text-emerald-300",
          pendingConfirmation:
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300",
          pendingAuthorization:
                "bg-violet-100 text-violet-700 dark:bg-violet-700/30 dark:text-violet-300",
          cancelled:
              "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300",
          closed:
              "bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300",
          interpreterRequested:
              "bg-rose-100 text-rose-700 dark:bg-rose-700/30 dark:text-rose-300",


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
