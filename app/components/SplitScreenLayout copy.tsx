"use client"

import React, { useRef, useEffect } from "react"
import { useCarousel } from "./context"
import gsap from "gsap"

interface Project {
  id: number
  title: string
  description?: string
  link?: string
}

export function SplitScreenLayout() {
  const { activeProject, centerIndex, projects } = useCarousel()
  const containerRef = useRef<HTMLDivElement>(null)
  const prevProjectRef = useRef<Project | null>(null)
  const prevIndexRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)

  useEffect(() => {
    if (!activeProject || centerIndex === null || isAnimatingRef.current) return

    const prevProject = prevProjectRef.current
    const prevIndex = prevIndexRef.current

    // Direction hesaplama
    let direction: "up" | "down" = "down"
    if (prevIndex !== null) {
      const delta = centerIndex - prevIndex
      direction = delta > 0 || (delta < 0 && Math.abs(delta) > projects.length / 2) ? "down" : "up"
    }

    isAnimatingRef.current = true

    const slideId = `slide-${activeProject.id}-${centerIndex}`

    // Yeni slide wrapper
    const wrapperDiv = document.createElement("div")
    wrapperDiv.id = slideId
    wrapperDiv.className = "slide-wrapper absolute left-0 w-full flex items-start justify-start p-16"
    wrapperDiv.style.pointerEvents = "none"
    wrapperDiv.style.top = "40vh"

    const contentDiv = document.createElement("div")
    contentDiv.className = "slide-content flex flex-col items-start"
    contentDiv.style.opacity = "0"
    contentDiv.style.transform = `translateY(${direction === "down" ? 150 : -150}px)`

    contentDiv.innerHTML = `
      <h1 style="font-size:8.375vw; line-height:1em; color:#fe3448;">${activeProject.title}</h1>
      <p style="font-size:1.375vw; line-height:1.6em; color:#fe3448; margin-top:1rem;">${activeProject.description || ""}</p>
      ${activeProject.link ? `<a href="${activeProject.link}" class="mt-4 underline inline-block">Open case study</a>` : ""}
    `

    wrapperDiv.appendChild(contentDiv)
    containerRef.current?.appendChild(wrapperDiv)

    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: "power3.inOut" },
      onComplete: () => {
        if (prevProject && prevIndex !== null) {
          const oldWrapperId = `slide-${prevProject.id}-${prevIndex}`
          const oldWrapper = containerRef.current?.querySelector(`#${oldWrapperId}`)
          oldWrapper?.remove()
        }
        prevProjectRef.current = activeProject
        prevIndexRef.current = centerIndex
        isAnimatingRef.current = false
      },
    })

    if (prevProject && prevIndex !== null) {
      const oldContent = containerRef.current?.querySelector(
        `#slide-${prevProject.id}-${prevIndex} .slide-content`
      )
      if (oldContent) {
        tl.to(oldContent, { y: direction === "down" ? -150 : 150, opacity: 0 })
      }
    }

    tl.to(contentDiv, { y: 0, opacity: 1 }, "<")

  }, [activeProject, centerIndex, projects])

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div ref={containerRef} className="w-full h-full relative"></div>
    </div>
  )
}
