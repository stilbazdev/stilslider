"use client"

import React, { useEffect, useMemo, useState, useRef } from "react"
import * as THREE from "three"
import { useCarousel } from "./context"
import { useThree, useFrame } from "@react-three/fiber"
import gsap from "gsap"
import { useRouter } from "next/navigation"
import { useProjects } from "../hooks/useProjects"


interface CarouselItemProps {
  index: number
  texture: THREE.Texture
}



function CarouselItem({ index, texture }: CarouselItemProps) {
  
  const { settings, setActiveIndex, activeIndex } = useCarousel()
  const [isActive, setIsActive] = useState(false)
  const [isCloseActive, setIsClosedActive] = useState(false)
  const { width, height } = settings
  const router = useRouter()
  const { projects } = useProjects() 


  useEffect(() => {
    setIsActive(activeIndex === index)
    setIsClosedActive(activeIndex !== index)
  }, [activeIndex])

  

  const { viewport } = useThree()
  const meshRef = useRef<THREE.Mesh>(null)

  // 🖱️ Mouse pozisyonunu ref olarak tut
  const mouse = useRef(new THREE.Vector2(0, 0))

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  

  const shaderArgs = useMemo(() => {
    const uniforms = {
      uTex: { value: texture },
      uGrayOverlay: { value: new THREE.Vector4(0, 0, 0, 0) },
      uTime: { value: 0 },
      uScrollSpeed: { value: 0 },
      uDistance: { value: 0 },
      uProgress: { value: isActive ? 0 : 0.6 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uEnableParallax: { value: settings.enableParallax },
      uEnableFloating: { value: settings.enableFloating },
      uZoomScale: {
        value: { x: viewport.width / width, y: viewport.height / height },
      },
      uIsActive: { value: isActive },
      uFloatingSpeed: { value: settings.floatingSpeed },
      uFloatingAmplitude: { value: settings.floatingAmplitude },
    }

    gsap.to(uniforms.uProgress, {
      value: isActive ? 1 : 0,
      duration: 1,
      ease: "power3.out",
    })

 

    


    
    // 🌀 Vertex Shader
    // 🌀 Vertex Shader - DÜZELTİLMİŞ
const vertexShader = /* glsl */ `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uScrollSpeed;
    uniform float uDistance;
    uniform vec2 uZoomScale;
    uniform float uProgress;
    uniform bool uIsActive;
    uniform bool uEnableParallax;
    uniform bool uEnableFloating;
    
    // ✅ PI'ı CONST olarak tanımla - bu çok önemli!
    const float PI = 3.141592653589793238;

    void main() {
        vUv = uv;
        vec3 pos = position;

        // ✅ Eğer aktifse floating efektini DURDUR
        if(!uIsActive && uEnableFloating){
            pos.y += sin(PI * uTime) * 0.2;
            pos.x += sin(PI * uTime) * 0.2;
        }

        // ✅ Eğer aktifse scroll efektini DURDUR
        if(!uIsActive) {
            pos.y += sin(PI * vUv.x) * uScrollSpeed * 0.7;
            pos.z += cos(PI * vUv.y) * uScrollSpeed * 0.7;
        }

        if(uEnableParallax){
            vec2 offset = (vUv - vec2(0.5));
            vUv = offset * 1.0 + vec2(0.5);
            vUv -= offset * uDistance * 0.3;

            float angle = uProgress * PI / 2.;
            float wave = cos(angle);
            float c = sin(length(vUv - vec2(0.5) * PI) * 15. + uProgress * 12.) * 0.5 + 0.5;
            pos.x *= mix(1.0, uZoomScale.x + wave * c, uProgress);
            pos.y *= mix(1.0, uZoomScale.y + wave * c, uProgress);
        }

        // ✅ Eğer aktifse sabit sallanmayı DURDUR
        if(!uIsActive) {
            pos.y += sin(PI * uTime) * 0.2;
            pos.x -= sin(PI * uTime) * 0.0;
            vUv.y -= sin(PI * uTime) * 0.02;
            vUv.x += sin(PI * uTime) * 0.01;
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`

    // ✨ Fragment Shader — Mouse Glow Efekti
    const fragmentShader = /* glsl */ `
      varying vec2 vUv;
      uniform sampler2D uTex;
      uniform vec2 uMouse;
      uniform float uTime;
      uniform float uDistance;

      void main() {
          vec3 texColor = texture2D(uTex, vUv).rgb;
          
          // Mouse parlaklık efekti - uDistance azaldıkça artan
          float dist = distance(vUv, uMouse);
          float intensity = smoothstep(0.5, 0.0, dist);
          vec3 glow = vec3(1.2, 1.1, 1.0) * pow(intensity, 1.5) * 0.5;
          glow *= (sin(uTime * 3.0) * 0.2 + 0.8);
          
          // Sadece merkezdeki resimde glow olsun (uDistance = 0)
          glow *= (1.0 - uDistance);
          
          // SIYAH BEYAZ
          float bw = (texColor.r + texColor.g + texColor.b) / 3.0;
          vec3 bwColor = vec3(bw, bw, bw);
          
          // uDistance 0 ise merkezde -> RENKLİ, diğerleri SİYAH BEYAZ
          texColor = mix(bwColor, texColor, 1.0 - uDistance);
          
          texColor += glow;
          gl_FragColor = vec4(texColor, 1.0);
      }
    `

    return { uniforms, vertexShader, fragmentShader }
  }, [
    texture,
    settings.enableParallax,
    settings.enableFloating,
    viewport.width,
    viewport.height,
    width,
    height,
    isActive,
  ])

  // 🎥 Animasyon Frame
// 🎥 Animasyon Frame
// 🎥 Animasyon Frame
useFrame(() => {
  if (!meshRef.current) return
  const mat = meshRef.current.material as THREE.ShaderMaterial
  mat.uniforms.uTime.value = performance.now() / 2000

  const uvMouse = new THREE.Vector2(
    (mouse.current.x + 1) / 2,
    (mouse.current.y + 1) / 2
  )
  
  // Smooth mouse takip
  mat.uniforms.uMouse.value.lerp(uvMouse, 0.1)

  // ✅ Tıklanınca pozisyonu merkeze getir ve scale'ı ayarla
  if (isActive) {
    gsap.to(meshRef.current.position, {
      x: 0,
      y: 0, 
      duration: 1,
      ease: "power3.out"
    })
    gsap.to(meshRef.current.scale, {
      x: 0.6,  // ← TIKLANINCA SCALE
      y: 1,
      z: 1,
      duration: 1,
      ease: "power3.out"
    })

    gsap.to(mat.uniforms.uDistance, {
      value: 0.1,
      duration: 1,
      ease: "power3.out"
    })

  } else {
    // Normal pozisyona dön (carousel pozisyonu)
    gsap.to(meshRef.current.position, {
      x: 2,
      y: 1,
      z: -5,
      duration: 1,
      ease: "power3.out"
    })
    gsap.to(meshRef.current.scale, {
      x: 1.0,  // ← NORMAL SCALE
      y: 1.0,
      z: 1.0,
      duration: 1,
      ease: "power3.out"
    })
  }
})

  // 🖱️ TIKLAMA DAVRANIŞI
  const handleClick = () => {
    const project = projects?.[index]
    if (!project?.slug) return
  
    // Aktif değilse önce aktif yap (opsiyonel, efekt için)
    setActiveIndex(index)
  
    // Hemen yönlendir
    router.push(`/projects/${project.slug}`)
  }
  
  
  const isClient = typeof window !== "undefined";

  return (
    <group onClick={handleClick}>
      <mesh
        ref={meshRef}
        position={[2, 1, -5]}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = "pointer"
  
          // 🔥 c-cursor'a 'm-link' class ekle
          const cursorEl = document.querySelector(".c-cursor")
          if (cursorEl) cursorEl.classList.add("m-link")
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          document.body.style.cursor = "default"
  
          // ❌ hover bitince kaldır
          const cursorEl = document.querySelector(".c-cursor")
          if (cursorEl) cursorEl.classList.remove("m-link")
        }}
      >
        <planeGeometry args={[settings.width, settings.height, 30, 30]} />
        <shaderMaterial args={[shaderArgs]} transparent depthWrite={false} />
      </mesh>



    </group>
    
  )
  

}



export default CarouselItem
