// TitleList.tsx
"use client"

import React, { useRef, useEffect, useState } from "react"
import { useCarousel } from "./context"
import { sliderColors } from "./settings"
import gsap from "gsap"
import { useRouter } from "next/navigation"
import { useProjects } from "../hooks/useProjects"

export function TitleList() {
  const { 
    activeIndex, 
    setActiveIndex, 
    setCenterIndex, 
    centerIndex,
    setActiveProject 
  } = useCarousel()
  
  const itemRefs = useRef<HTMLDivElement[]>([])
  const barsRef = useRef<HTMLDivElement[]>([])
  const [hovered, setHovered] = useState(false)
  const router = useRouter()
  
  const { projects, loading } = useProjects()

  // Aktif projeyi güncelle
  useEffect(() => {
    if (projects.length > 0) {
      const currentIndex = activeIndex !== null ? activeIndex : centerIndex
      setActiveProject(projects[currentIndex] || null)
    }
  }, [activeIndex, centerIndex, projects, setActiveProject])

  // Hover + color animation
  useEffect(() => {
    // Eğer hover değilse ve çıkış animasyonu için çalışıyoruz, hovered false ise animasyon çalışır
    if (hovered === null) return // null ise hiç dokunma, sadece mouse eventi tetikleyecek
  
    const currentIndex = activeIndex !== null ? activeIndex : centerIndex
  
    itemRefs.current.forEach((item, index) => {
      if (!item) return
      const isActive = currentIndex === index
      const targetOpacity = hovered ? (isActive ? 1 : 0.8) : 0
  
      const title = item.querySelector("h1") as HTMLElement
      if (title) {
        gsap.to(title, {
          opacity: targetOpacity,
          color: isActive ? sliderColors[index % sliderColors.length] : "#ffffff",
          duration: 0.5,
          ease: "power2.out",
        })
      }
  
      // Skew animation
      gsap.fromTo(
        item,
        { skewX: 0 },
        {
          skewX: hovered ? 40 : -40,
          duration: 0.25,
          ease: "power2.out",
          delay: index * 0.05,
          onComplete: () => {
            gsap.to(item, {
              skewX: 0,
              duration: 0.25,
              ease: "power2.inOut",
            })
          },
        }
      )
    })
  
    // Bar width animation
    if (hovered) {
      gsap.fromTo(
        barsRef.current,
        { width: "8px" },
        {
          width: "100%",
          duration: 0.25,
          ease: "power2.out",
          stagger: 0.05,
          onComplete: () => {
            gsap.to(barsRef.current, {
              width: "8px",
              duration: 0.05,
              ease: "power2.inOut",
              stagger: 0.05,
            })
          },
        }
      )
    } else {
      gsap.fromTo(
        barsRef.current,
        { width: "100%" },
        {
          width: "8px",
          duration: 0.25,
          ease: "power2.inOut",
          stagger: { each: 0.05, from: "end" },
        }
      )
    }
  }, [hovered, projects])
  

  // Bar color update on active slide
  useEffect(() => {
    const currentIndex = activeIndex !== null ? activeIndex : centerIndex
    barsRef.current.forEach((bar, index) => {
      if (!bar) return
      const isActive = currentIndex === index
      gsap.to(bar, {
        background: isActive ? sliderColors[index % sliderColors.length] : "#ffffff",
        duration: 0.5,
        ease: "power2.out",
      })
    })
  }, [activeIndex, centerIndex, projects])

  const handleItemClick = (index: number) => {
    setActiveIndex(index)
    setCenterIndex(index)
    setActiveProject(projects[index])
    router.push(`/projects/${projects[index].slug}`)
  }

  const handleMouseEnter = (index: number) => {
    setCenterIndex(index)
    setActiveProject(projects[index])
  }

  if (loading) return null

  return (
    <div className="fixed top-1/2 right-10 transform -translate-y-1/2 z-20 pointer-layer">
      <div
        className="flex flex-col items-end space-y-6"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {projects.map((p, index) => (
          <div
            key={p.id}
            className="relative cursor-pointer"
            onClick={() => handleItemClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            ref={(el) => {
              if (el) itemRefs.current[index] = el
            }}
          >
            {/* Title */}
            <div className="m-0 pr-9 transition-all duration-300">
              <h1 className="text-2xl font-bold whitespace-nowrap opacity-0">
                {p.title}
              </h1>
            </div>

            {/* Vertical Progress Bar */}
            <div
              ref={(el) => {
                if (el) barsRef.current[index] = el
              }}
              className="absolute top-1/2 right-2 h-[20px] rounded-md transition-all duration-300"
              style={{ transform: "translateY(-50%)", background: "#ffffff", width: "8px" }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}