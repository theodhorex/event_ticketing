"use client";

import React from "react";
import { cn } from "@/lib/utils";

type MenuToggleIconProps = {
  open: boolean;
  className?: string;
  duration?: number;
};

export function MenuToggleIcon({ open, className, duration = 300 }: MenuToggleIconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("transition-all", className)}
      style={{ transitionDuration: `${duration}ms` }}
    >
      <path
        d="M1.5 4.5H16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "origin-center transition-all ease-out",
          open ? "translate-y-[6px] rotate-45" : ""
        )}
        style={{ transitionDuration: `${duration}ms` }}
      />
      <path
        d="M1.5 9H16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "origin-center transition-all ease-out",
          open ? "opacity-0 -translate-x-2" : ""
        )}
        style={{ transitionDuration: `${duration}ms` }}
      />
      <path
        d="M1.5 13.5H16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "origin-center transition-all ease-out",
          open ? "-translate-y-[6px] -rotate-45" : ""
        )}
        style={{ transitionDuration: `${duration}ms` }}
      />
    </svg>
  );
}
