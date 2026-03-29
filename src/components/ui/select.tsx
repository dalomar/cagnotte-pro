import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils"
import { Check, ChevronDown } from "lucide-react"

const Select = React.forwardRef<
  HTMLDivElement,
  { value?: string; onValueChange?: (value: string) => void; children: React.ReactNode }
>(({ value, onValueChange, children }, ref) => {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const selectedChild = React.Children.toArray(children).find(
    (child: any) => child.props?.value === value
  ) as any

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
      >
        <span>{selectedChild?.props?.children}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
      
      {open && mounted && createPortal(
        <div className="fixed z-50 mt-2 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50">
          {React.Children.map(children, (child: any) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onClick: () => {
                  onValueChange?.(child.props.value)
                  setOpen(false)
                },
                isSelected: child.props.value === value,
              })
            }
            return child
          })}
        </div>,
        document.body
      )}
    </div>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <button ref={ref} className={cn("", className)} {...props}>
    {children}
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="block truncate">{placeholder}</span>
)

const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; isSelected?: boolean }
>(({ className, children, value, isSelected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-800 dark:focus:text-slate-50",
      isSelected && "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {isSelected && <Check className="h-4 w-4" />}
    </span>
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }