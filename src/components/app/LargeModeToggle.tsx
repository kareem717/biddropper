import { ComponentPropsWithoutRef, FC } from "react"
import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useTheme } from "next-themes"
import { Icons } from "../Icons"

export interface LargeModeToggleProps extends ComponentPropsWithoutRef<"div"> {
}

export const LargeModeToggle: FC<LargeModeToggleProps> = ({ className, ...props }) => {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <ToggleGroup type="single" className={cn("w-full rounded-lg border p-1", className)} value={resolvedTheme}>
      <ToggleGroupItem value="dark" className="w-full" aria-label="Toggle dark mode" onClick={() => setTheme("dark")}>
        <Icons.moon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="light" className="w-full" aria-label="Toggle light mode" onClick={() => setTheme("light")}>
        <Icons.sun className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}