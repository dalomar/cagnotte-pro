import * as React from "react"
import { cn } from "../../lib/utils"

const Tabs = ({ defaultValue, value, onValueChange, children, className }: any) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)

  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value: currentValue,
            onValueChange: handleValueChange,
          } as any)
        }
        return child
      })}
    </div>
  )
}

const TabsList = ({ className, children }: any) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 p-1 text-slate-500 dark:text-slate-400 w-full", className)}>
    {children}
  </div>
)

const TabsTrigger = ({ value, onValueChange, children, className }: any) => {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value

  return (
    <button
      type="button"
      onClick={() => onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50 flex-1",
        isActive && "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm",
        className
      )}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, className }: any) => {
  const context = React.useContext(TabsContext)
  const isActive = context?.value === value

  if (!isActive) return null

  return (
    <div className={cn("mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300", className)}>
      {children}
    </div>
  )
}

const TabsContext = React.createContext<{ value: string; onValueChange: (val: string) => void } | null>(null)

export { Tabs, TabsList, TabsTrigger, TabsContent }