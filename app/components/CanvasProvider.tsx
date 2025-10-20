"use client"

import { createContext, useContext, ReactNode } from 'react'

interface CanvasContextType {
  showCanvas: boolean
  setShowCanvas: (show: boolean) => void
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined)

export function CanvasProvider({ children }: { children: ReactNode }) {
  // Bu değer route'a göre değişecek
  const showCanvas = false // Default değer

  return (
    <CanvasContext.Provider value={{ showCanvas, setShowCanvas: () => {} }}>
      {children}
    </CanvasContext.Provider>
  )
}

export const useCanvas = () => {
  const context = useContext(CanvasContext)
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider')
  }
  return context
}