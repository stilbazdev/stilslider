"use client"

import { useRouter } from "next/navigation"
import { useCarousel } from "./context"

export function handleBack(router: ReturnType<typeof useRouter>, setActiveIndex: (v: number | null) => void) {
  // 🎯 aktif slider'ı kapat
  setActiveIndex(null)

  // 🏠 ana sayfaya dön
  router.push("/")
}

export default function BackButton() {
  const router = useRouter()
  const { setActiveIndex } = useCarousel()

  const handleClick = () => {
    handleBack(router, setActiveIndex)
  }

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 left-4 z-50 bg-gray-900/80 hover:bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold transition-colors"
    >
      ×
    </button>
  )
}
