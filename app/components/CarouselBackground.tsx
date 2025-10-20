"use client"

import React, { forwardRef } from "react"

interface CarouselBackgroundProps {
  ref?: React.Ref<HTMLDivElement>
}

export const CarouselBackground = forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{
        backgroundColor: "transparent",
        transition: "background-color 1.5s ease",
      }}
    />
  )
})

CarouselBackground.displayName = "CarouselBackground"
