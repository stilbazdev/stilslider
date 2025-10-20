// VideoPreview.tsx (Düzeltilmiş versiyon)
"use client"

import React, { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import gsap from "gsap"

interface VideoPreviewProps {
  frontVideoUrl: string
  backVideoUrl: string
  settings: any
  flipTrigger: boolean
}

export default function VideoPreview({
  frontVideoUrl,
  backVideoUrl,
  settings,
  flipTrigger,
}: VideoPreviewProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [materials, setMaterials] = useState<{
    front: THREE.MeshBasicMaterial | null
    back: THREE.MeshBasicMaterial | null
  }>({ front: null, back: null })
  
  const [isAnimating, setIsAnimating] = useState(false)
  const prevFlipTriggerRef = useRef(false)

  // Video texture'ları oluştur
  useEffect(() => {
    if (!frontVideoUrl || !backVideoUrl) return

    const createVideoTexture = (url: string): Promise<THREE.MeshBasicMaterial> => {
      return new Promise((resolve) => {
        const video = document.createElement("video")
        video.src = url
        video.crossOrigin = "anonymous"
        video.loop = true
        video.muted = true
        video.autoplay = true
        video.playsInline = true
        video.preload = "auto"

        const texture = new THREE.VideoTexture(video)
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.format = THREE.RGBFormat

        const material = new THREE.MeshBasicMaterial({
          map: texture,
          toneMapped: false,
          side: THREE.DoubleSide
        })

        video.play().catch(() => {
          // Autoplay engellendiyse, kullanıcı etkileşimi sonrası tekrar dene
          const playOnInteraction = () => {
            video.play()
            document.removeEventListener('click', playOnInteraction)
          }
          document.addEventListener('click', playOnInteraction)
        })

        resolve(material)
      })
    }

    Promise.all([
      createVideoTexture(frontVideoUrl),
      createVideoTexture(backVideoUrl)
    ]).then(([frontMaterial, backMaterial]) => {
      setMaterials({ front: frontMaterial, back: backMaterial })
    })

  }, [frontVideoUrl, backVideoUrl])

  // Texture'ları güncelle
  useFrame(() => {
    if (materials.front?.map) {
      (materials.front.map as THREE.VideoTexture).needsUpdate = true
    }
    if (materials.back?.map) {
      (materials.back.map as THREE.VideoTexture).needsUpdate = true
    }
  })

  // Flip animasyonu - DÜZELTİLMİŞ VERSİYON
  useEffect(() => {
    if (!meshRef.current || !materials.front || !materials.back) return
    if (isAnimating) return // Animasyon devam ediyorsa yeni animasyon başlatma
    
    // flipTrigger değiştiğinde ve önceki değerden farklıysa animasyonu başlat
    if (flipTrigger !== prevFlipTriggerRef.current) {
      prevFlipTriggerRef.current = flipTrigger
      
      setIsAnimating(true)
      
      const targetRotation = isFlipped ? 0 : Math.PI
      
      gsap.to(meshRef.current.rotation, {
        y: targetRotation,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
          setIsFlipped(!isFlipped)
          setIsAnimating(false)
        },
      })
    }
  }, [flipTrigger, isFlipped, materials, isAnimating])

  // Material yüklenene kadar loading state
  if (!materials.front || !materials.back) {
    return (
      <mesh position={[-6, -2.5, 0]}>
        <planeGeometry args={[1.8, 1.2]} />
        <meshBasicMaterial color="#666666" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    )
  }

  return (
    <mesh ref={meshRef} position={[-6, -2.5, 0]}>
      <planeGeometry args={[1.8, 1.2]} />
      <meshBasicMaterial
        {...(isFlipped ? materials.back : materials.front)}
      />
    </mesh>
  )
}