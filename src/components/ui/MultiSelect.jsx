import React, { useState } from "react";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "cmdk";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import { Badge } from "./Badge";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder,
  className,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleUnselect = (option) => {
    onChange(selected.filter((s) => s.value !== option.value));
  };

  const filteredOptions = options.filter(
    (option) => !selected.some((s) => s.value === option.value)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("group w-full cursor-pointer", className)}>
          <div className="flex flex-wrap gap-1.5 p-2 border border-input rounded-md min-h-[40px] items-center">
            {selected.length > 0 ? (
              selected.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="pl-2 pr-1 py-1 text-sm"
                >
                  {option.label}
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(option)}
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm ml-2">
                {placeholder}
              </span>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange([...selected, option]);
                  }}
                  className="cursor-pointer"
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
