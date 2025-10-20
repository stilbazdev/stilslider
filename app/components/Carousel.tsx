"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import CarouselItem from "./CarouselItem"
import { Html, useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import gsap from "gsap"
import { useCarousel } from "./context"
import { useProjects } from "../hooks/useProjects"
import { usePathname } from "next/navigation"
import { useOnBackButton } from "../hooks/useOnBackButton"
import dynamic from "next/dynamic"

interface CarouselProps {
  onColorChange?: (color: string) => void
  onActiveProjectChange?: (project: any) => void 
}

// VideoPreview'u dynamic import ile al
const VideoSingleCard = dynamic(() => import("./VideoPreview"), { ssr: false })


function Carousel({ onColorChange, onActiveProjectChange }: CarouselProps) {
  const pathname = usePathname()
  const currentSlug = pathname.split("/").pop()

  const rootGroupRef = useRef<THREE.Group | null>(null)
  const htmlOverlayRef = useRef<HTMLDivElement>(null)

  const [flipTrigger, setFlipTrigger] = useState(false)
  const prevCenterIndex = useRef<number | null>(null)
  const [flip, setFlip] = React.useState(false)

  const progressRef = useRef(0)
  const prevProgressRef = useRef(0)
  const scrollSpeedRef = useRef(0)
  const currentColorRef = useRef("transparent")
  const lastCenterIndexRef = useRef<number>(-1)

  const { projects, loading } = useProjects()
  const { settings, activeIndex, setActiveIndex, centerIndex, setCenterIndex, setActiveProject } =
    useCarousel()

  const textures = useTexture(projects.map((p) => p.image))

  useOnBackButton(() => {
    setActiveIndex(null)
    console.log("Tarayıcı back/forward tuşuna basıldı!") // ✅ sadece log
  })

  // URL değişimlerini handle eden fonksiyon
  const handleUrlChange = useCallback(() => {
    if (!projects?.length) return
    
    const slug = pathname.split("/projects/")[1] || currentSlug
    if (!slug) return
  
    const index = projects.findIndex(p => p.slug === slug)
    if (index !== -1) {
      console.log("URL changed to index:", index)
      
      // PROGRESS REF'İ GÜNCELLE - bu çok önemli!
      progressRef.current = (index / projects.length) * 100
      
      // State'leri güncelle
      setActiveIndex(index)
      setCenterIndex(index)
      
      // Active project'i güncelle
      if (projects[index]) {
        setActiveProject(projects[index])
        onActiveProjectChange?.(projects[index])
      }
    }
  }, [pathname, projects, currentSlug, setActiveIndex, setCenterIndex, setActiveProject, onActiveProjectChange])



  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!projects?.length) return
      let newIndex: number | null = null
  
      if (e.key === "ArrowDown") {
        newIndex = Math.min((centerIndex ?? 0) + 1, projects.length - 1)
      } else if (e.key === "ArrowUp") {
        newIndex = Math.max((centerIndex ?? 0) - 1, 0)
      }
  
      if (newIndex !== null && newIndex !== centerIndex) {
        setCenterIndex(newIndex)
      }
    }
  
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [projects, centerIndex, setCenterIndex, setActiveProject])
  

  
  useEffect(() => {
    if (prevCenterIndex.current !== null && centerIndex !== prevCenterIndex.current) {
      setFlipTrigger(prev => !prev) // toggle flip
    }
    prevCenterIndex.current = centerIndex
  }, [centerIndex])
  
  // 1. Normal URL değişimleri için useEffect
  useEffect(() => {
    handleUrlChange()
  }, [handleUrlChange])

  // 2. İleri/geri butonları için popstate event'i


  // 3. Ayrıca pathname değişimini de dinle (next.js navigation için)
  useEffect(() => {
    handleUrlChange()
  }, [pathname, handleUrlChange])

  // Scroll davranışı
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (activeIndex !== null) return
      const delta = e.deltaY * 0.15
      let newProgress = progressRef.current + delta
      newProgress = Math.round(Math.max(0, Math.min(100, newProgress)))
      progressRef.current = newProgress
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [activeIndex])

  // Animasyon loopu - ORİJİNAL KODUN AYNI KALSIN
  useFrame(() => {
    if (loading || !rootGroupRef.current) return
    const items = rootGroupRef.current.children || []
    if (!items.length) return

    const rawProgress = progressRef.current
    const scrollSpeed = rawProgress - prevProgressRef.current
    scrollSpeedRef.current = scrollSpeed
    prevProgressRef.current = rawProgress

    const progress = Math.max(0, Math.min(100, rawProgress))
    const fraction = (progress / 100) * items.length
    let newCenterIndex = Math.round(fraction)
    newCenterIndex = Math.max(0, Math.min(projects.length - 1, newCenterIndex))

    if (lastCenterIndexRef.current !== newCenterIndex) {
      lastCenterIndexRef.current = newCenterIndex
      setCenterIndex(newCenterIndex)
      requestAnimationFrame(() => {
        if (projects[newCenterIndex]) setActiveProject({ ...projects[newCenterIndex] })
      })
    }

    const currentCenter = centerIndex
    const newColor =
      activeIndex === null
        ? projects[currentCenter]?.bgColor || "transparent"
        : projects[activeIndex]?.bgColor || "transparent"

    if (onColorChange && newColor !== currentColorRef.current) {
      currentColorRef.current = newColor
      onColorChange(newColor)
    }

    items.forEach((item, index) => {
      const distance = index - centerIndex
      const y = -distance * (settings.height + settings.itemGap)
      const z = -Math.abs(distance) * 3
      const scale = distance === 0 ? 1.4 : 1.6

      item.visible = Math.abs(distance) <= 3
      if (activeIndex !== null) item.visible = activeIndex === index

      gsap.to(item.position, { x: 0, y, z, duration: 1.5, ease: "power3.out" })
      gsap.to(item.scale, { x: scale, y: scale, z: scale, duration: 1.5, ease: "power3.out" })

      const material = (item.children[0] as THREE.Mesh).material as THREE.ShaderMaterial
      gsap.to(material.uniforms.uGrayOverlay.value, {
        x: 0.7,
        y: 0.7,
        z: 0.7,
        w: distance === 0 ? 0 : 0.7,
        duration: 2,
        ease: "power3.out",
      })
      gsap.to(material.uniforms.uDistance, { value: Math.abs(distance) > 0 ? 1 : 0, duration: 2, ease: "power3.out" })
      gsap.to(material.uniforms.uScrollSpeed, { value: scrollSpeed, duration: 2, ease: "power3.out" })
      material.uniforms.uTime.value = performance.now() / 1400

      const tl = gsap.timeline()
      const htmlOverlayLeft = activeIndex !== null ? "-40vw" : "-100vw"
      const htmlOverlayOpacity = activeIndex !== null ? 1 : 0

      tl.to(rootGroupRef.current.rotation, { x: settings.rotation[0], y: settings.rotation[1], z: settings.rotation[2], duration: 0.8, ease: "power3.out" })
        .to(rootGroupRef.current.position, { x: settings.position[0], y: settings.position[1], z: 0, duration: 0.8, ease: "power3.out" })
        .to(htmlOverlayRef.current, { opacity: htmlOverlayOpacity, duration: 0.8, ease: "power3.out" })
        .to(htmlOverlayRef.current, { x: htmlOverlayLeft, duration: 0.8, ease: "power3.out" }, "<-0.3")
    })
  })

  if (loading) return <Html><div className="text-white">Loading projects...</div></Html>

  return (
    <>
      <group ref={rootGroupRef}>
        {textures.map((texture, index) => (
          <CarouselItem key={index} index={index} texture={texture} />
        ))}
      </group>

      {/* VideoPreview'u carousel dışında SABİT pozisyonda render et */}
     
     
      {centerIndex !== null && projects[centerIndex]?.video && (
  <VideoSingleCard
    // YENİ PROP'LAR:
    frontVideoUrl={projects[centerIndex].video}
    settings={settings}
    data={{ // Gerekli verileri 'data' objesi içine topluyoruz
      bgColor: projects[centerIndex].bgColor,
      video: projects[centerIndex].video, // Aslında frontVideoUrl ile aynı, ama interface'e uysun
    }}
    // face, width, height, opacity, pointer gibi diğer prop'ları 
    // VideoSingleCard içinde settings ve useThree'den alacak şekilde düzenledik.
  />
)}


    </>
  )
}

export const WrappedCarousel = ({ onColorChange }: CarouselProps) => (
  <Carousel onColorChange={onColorChange} />
)