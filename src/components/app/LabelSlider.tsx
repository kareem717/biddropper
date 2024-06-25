"use client";

import { FC, useEffect, type ComponentPropsWithoutRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/utils";
import { Input } from "@/components/ui/input";
import useLabelSlider from "@/lib/hooks/useLabelSlider";

export interface LabelSliderProps extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
}

export const LabelSlider: FC<LabelSliderProps> = (
  {
    className,
    value: valueProp,
    onValueChange: onValueChangeProp,
    onBlur,
    onFocus,
    label,
    ...props
  },
) => {
  const {
    getIsEditing,
    setIsEditing,
    getLabel,
    setLabel,
    getValue,
    setValue,
  } = useLabelSlider();

  useEffect(() => {
    const defaultValue = valueProp?.[0] || props.defaultValue?.[0] || props.min || 0;
    setValue(defaultValue);
  }, [valueProp, props.defaultValue, props.min, setValue]);

  const handleValueChange = (newValue: number[]) => {
    setValue(newValue[0]);
    if (onValueChangeProp) onValueChangeProp(newValue);
  };


  const handleInputBlur = () => {
    setIsEditing(false);

    const currentValue = getValue();
    if (currentValue) {
      // Clamp the value to the min and max
      if (props.max !== undefined && currentValue > props.max) {
        setValue(props.max);
      } else if (props.min !== undefined && currentValue < props.min) {
        setValue(props.min);
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    }
  };

  return (
    <SliderPrimitive.Root
      className={cn(
        "group relative flex w-full touch-none select-none items-center",
        className,
      )}
      value={[getValue()]}
      onValueChange={handleValueChange}
      onFocus={(e) => {
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        if (onBlur) onBlur(e);
      }}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {getIsEditing() ? (
        <Input
          autoFocus
          type="number"
          className="absolute bottom-full left-1/2 mb-2 w-1/3 -translate-x-1/2 rounded-md bg-background p-2 text-sm shadow-lg"
          defaultValue={getValue()}
          onChange={(e) => handleValueChange([Number(e.target.value)])}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          min={props.min}
          max={props.max}
          step={props.step}
        />
      ) : (
        <div
          tabIndex={0}
          className={cn(
            "absolute bottom-full left-1/2 mb-2 -translate-x-1/2 cursor-pointer rounded-md bg-background p-2 text-sm shadow-lg",
            getIsEditing() ? "hidden" : "block",
          )}
          onClick={() => setIsEditing(true)}
        >
          {getValue()}
          {label}
        </div>
      )}
      <SliderPrimitive.Thumb
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsEditing(true);
            e.preventDefault();
          }
        }}
        className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  );
};