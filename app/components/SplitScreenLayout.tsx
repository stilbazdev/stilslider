"use client"

import React, { useRef, useEffect } from "react"
import { useCarousel } from "./context"
import gsap from "gsap"
import { useRouter } from "next/navigation"

export function SplitScreenLayout() {
  const router = useRouter()
  const { activeProject, centerIndex, activeIndex } = useCarousel()
  const containerRef = useRef<HTMLDivElement>(null)
  const currentContentRef = useRef<HTMLDivElement | null>(null)
  const prevIndexRef = useRef<number | null>(null)
  const isAnimatingRef = useRef(false)
  const lastProjectIdRef = useRef<number | null>(null)
  const pendingAnimationRef = useRef<{ project: any; index: number } | null>(null)

  // --- Aktif proje değişimi ---
  useEffect(() => {
    if (!activeProject || centerIndex === null) return
    
    const id = setTimeout(() => {
      if (activeProject?.id !== lastProjectIdRef.current) {
        startAnimation(activeProject, centerIndex)
      }
    }, 200)
  
    return () => clearTimeout(id)
  }, [activeProject, centerIndex])

  // --- Tıklama durumu değişimi ---
  useEffect(() => {
    if (!currentContentRef.current) return

    const title = currentContentRef.current.querySelector(".slide-title")
    const desc = currentContentRef.current.querySelector(".slide-description")
    const btn = currentContentRef.current.querySelector(".open-link")

    if (!title || !desc || !btn) return

    // Eğer tıklanmışsa
    if (activeIndex !== null) {
      gsap.to([desc, btn], { opacity: 0, y: 20, duration: 0.5, ease: "power2.out" })
      gsap.to(title, { y: 100, duration: 0.6, ease: "power3.out" })
    } else {
      gsap.to([desc, btn], { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
      gsap.to(title, { y: 0, duration: 0.6, ease: "power3.out" })
    }
  }, [activeIndex]) // 👈 sadece tıklanma değiştiğinde çalışır


  const startAnimation = (project: any, index: number) => {
    isAnimatingRef.current = true
    lastProjectIdRef.current = project.id

    const direction: "up" | "down" = prevIndexRef.current !== null 
      ? index > prevIndexRef.current ? "down" : "up" 
      : "down"

    const newContent = document.createElement("div")
    newContent.className = "slide-content absolute left-0 w-full flex items-start justify-start p-16 no-pointer-layer"
    newContent.style.pointerEvents = "auto"
    
    newContent.innerHTML = `
      <div class="flex flex-col items-start pointer-layer">
        <h1 class="slide-title text-6xl font-bold" style="color:${project.color};">${project.title}</h1>
        <p class="slide-description mt-4 text-lg" style="color:${project.textcolor};">${project.description || ""}</p>
        <button class="open-link mt-4 underline" style="color:${project.textcolor};"> Open case study</button>
      </div>
    `

    containerRef.current?.appendChild(newContent)

    const btn = newContent.querySelector(".open-link")
    if (btn) {
      btn.addEventListener("click", () => router.push(`/projects/${project.slug}`))
    }

    gsap.set(newContent, {
      y: direction === "down" ? 250 : -250,
      opacity: 0
    })

    const hasOldContent = !!currentContentRef.current
    
    const tl = gsap.timeline({
      onComplete: () => {
        const allContents = containerRef.current?.querySelectorAll('.slide-content') || []
        allContents.forEach(content => {
          if (content !== newContent) content.remove()
        })

        currentContentRef.current = newContent
        prevIndexRef.current = index
        isAnimatingRef.current = false

        if (pendingAnimationRef.current) {
          const nextAnimation = pendingAnimationRef.current
          pendingAnimationRef.current = null
          setTimeout(() => startAnimation(nextAnimation.project, nextAnimation.index), 50)
        }
      }
    })

    if (hasOldContent && currentContentRef.current) {
      tl.to(currentContentRef.current, {
        y: direction === "down" ? -250 : 250,
        opacity: 0,
        duration: 0.7,
        ease: "power3.inOut"
      })
    }

    tl.to(newContent, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.inOut"
    }, hasOldContent ? "<" : undefined)
  }

  return (
    <div className="splide-gap w-full h-full overflow-hidden no-pointer-layer">
      <div ref={containerRef} className="w-full h-full relative"></div>
    </div>
  )
}
