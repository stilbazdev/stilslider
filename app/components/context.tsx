"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import {
  GROUP_POSITION_ACTIVE,
  GROUP_POSITION_DEFAULT,
  GROUP_ROTATION_ACTIVE,
  GROUP_ROTATION_DEFAULT,
  ITEM_GAP,
  planeSettings,
} from "./settings"

// Project tipi
interface Project {
  id: number
  title: string
  description: string
  link: string
  slug: string
}

// Carousel ayarları tipi
interface CarouselSettings {
  width: number
  height: number
  rotation: [number, number, number]
  position: [number, number, number]
  itemGap: number
  enableParallax: boolean
  enableFloating: boolean
  floatingSpeed: number
  floatingAmplitude: number
}

// Context tipi
interface CarouselContextType {
  activeIndex: number | null
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>
  centerIndex: number
  setCenterIndex: React.Dispatch<React.SetStateAction<number>>
  activeProject: Project | null
  setActiveProject: React.Dispatch<React.SetStateAction<Project | null>>
  settings: CarouselSettings
  isActive: boolean
  toggleParallax: () => void
  toggleFloating: () => void
}

// Context oluştur
const CarouselContext = createContext<CarouselContextType | null>(null)

// Hook
export const useCarousel = () => {
  const context = useContext(CarouselContext)
  if (!context) throw new Error("useCarousel must be used within a CarouselProvider")
  return context
}

// Provider
export const CarouselProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [centerIndex, setCenterIndex] = useState(0)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [settings, setSettings] = useState<CarouselSettings>({
    width: planeSettings.width,
    height: planeSettings.height,
    rotation: GROUP_ROTATION_DEFAULT,
    position: GROUP_POSITION_DEFAULT,
    itemGap: ITEM_GAP,
    enableFloating: true,
    enableParallax: true,
    floatingSpeed: 0.3,
    floatingAmplitude: 0.09,
  })

  const isActive = activeIndex !== null

  const toggleParallax = () =>
    setSettings((prev) => ({ ...prev, enableParallax: !prev.enableParallax }))
  const toggleFloating = () =>
    setSettings((prev) => ({ ...prev, enableFloating: !prev.enableFloating }))

  // Aktiflik değiştikçe rotation ve position değişimi
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      rotation: isActive ? GROUP_ROTATION_ACTIVE : GROUP_ROTATION_DEFAULT,
      position: isActive ? GROUP_POSITION_ACTIVE : GROUP_POSITION_DEFAULT,
    }))
  }, [isActive, activeIndex])

  return (
    <CarouselContext.Provider
      value={{
        settings,
        activeIndex,
        setActiveIndex,
        centerIndex,
        setCenterIndex,
        activeProject,
        setActiveProject,
        isActive,
        toggleParallax,
        toggleFloating,
      }}
    >
      {children}
    </CarouselContext.Provider>
  )
}
