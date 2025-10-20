// components/ProjectWrapper.tsx
"use client"

import React, { useRef, useEffect, useState } from 'react'
import { useCarousel } from "./context"
import gsap from 'gsap'

interface ProjectWrapperProps {
  children: React.ReactNode
}

export function ProjectWrapper({ children }: ProjectWrapperProps) {
  const { activeIndex } = useCarousel()
  const wrapperRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (wrapperRef.current) {
      gsap.to(wrapperRef.current, {
        clipPath: activeIndex !== null ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)',
        duration: 1,
        ease: 'power3.out'
      })
    }
  }, [activeIndex])

  return (
    <div 
      ref={wrapperRef}
      className="fixed inset-0"
      style={{
        clipPath: 'inset(0% 0% 0% 0%)'
      }}
    >
      {children}
    </div>
  )
}