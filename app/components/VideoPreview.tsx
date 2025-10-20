"use client"

import React, { useEffect, useRef, useMemo } from "react"
import * as THREE from "three"
import { useThree, extend, useFrame } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import gsap from "gsap"
import { useCarousel } from "./context"

// === Shader tanımı ===
const VideoSingleMaterial = shaderMaterial(
  {
    uTexture: null,
    uLoaderProgress: 1.0,
    uHomeProgress: 0.0,
    uResolution: new THREE.Vector2(0, 0),
    uFace: 0,
    uColor: new THREE.Color(0, 0, 0),
    uSize: new THREE.Vector2(0, 0),
    uAspectRatio: 0,
    uOpacity: 1.0,
    uPointer: new THREE.Vector2(0, 0),
  },
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  uniform sampler2D uTexture;
  uniform float uLoaderProgress;
  uniform float uHomeProgress;
  uniform vec2 uResolution;
  uniform vec3 uColor;
  uniform vec2 uSize;
  uniform float uAspectRatio;
  uniform float uOpacity;
  uniform vec2 uPointer;
  varying vec2 vUv;

  #define HALF_PI 1.5707963267948966

  float sineOut(float t) {
      return sin(t * HALF_PI);
  }

  mat2 scale(vec2 value){
      return mat2(value.x, 0.0, 0.0, value.y);
  }

  vec2 scaleUv(vec2 uv, vec2 scaleFactor){
      vec2 parsedScaleFactor = 1.0 - (scaleFactor - 1.0);
      uv -= 0.5;
      uv *= scale(parsedScaleFactor);
      uv += 0.5;
      return uv;
  }

  float roundedCorners(vec2 size, vec2 uv) {
      vec2 center = size * 0.5;
      vec2 hsize = size * 0.5;
      vec2 pos = uv * size;
      float radius = 0.035;
      float roundedRect = length(max(abs(pos - center) - (hsize - radius), 0.0)) - radius;
      roundedRect = 1.0 - roundedRect;
      roundedRect = smoothstep(0.99, 1.0, roundedRect);
      return roundedRect;
  }

  void main(){
    vec2 st = gl_FragCoord.xy / uResolution;
    vec2 uv = vUv;
    if (gl_FrontFacing == false) {
        uv.y = 1.0 - uv.y;
    }

    float flipProgress = uLoaderProgress; // artık gerçek progress
    float angle = flipProgress * 3.1415926 * 2.0;
    float cosA = cos(angle);

    uv.x = (uv.x - 0.5) * cosA + 0.5;
    float alpha = abs(cosA);
    uv = scaleUv(uv, vec2(0.96, 0.93));

    vec4 color = texture2D(uTexture, uv);
    color.rgb *= alpha;

    vec4 border = vec4(uColor, 1.0);
    if (uv.x <= 0.0 || uv.x >= 1.0 || uv.y <= 0.0 || uv.y >= 1.0)
        color = border;

    float width = 0.45;
    float brighteness = 0.12;
    float aspectRatio = uResolution.x / uResolution.y;
    vec2 pointer = uPointer / uResolution;
    pointer.y = 1.0 - pointer.y;
    vec2 dist = pointer - st.xy;
    dist *= vec2(aspectRatio, 1.0);
    float value = sineOut(min(length(dist) / width, 1.0));
    value = (1.0 - value) * brighteness * color.a;

    vec4 light = vec4(value);
    float roundedRect = roundedCorners(uSize, vUv);

    gl_FragColor = color + light;
    gl_FragColor.a = roundedRect;
  }
`
)

extend({ VideoSingleMaterial })

interface CarouselVideoCardProps {
  frontVideoUrl: string
  settings: {
    width: number
    height: number
    rotation: number[]
    position: number[]
    itemGap: number
  }
  data: { bgColor: string; video: string }
  opacity?: number
}

export default function VideoSingleCard({
  frontVideoUrl,
  settings,
  data,
  opacity = 1.0,
}: CarouselVideoCardProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<unknown>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const { size, mouse, viewport } = useThree()
  const { centerIndex } = useCarousel()

  const lastCenterIndex = useRef(centerIndex)
  const tweenRef = useRef<GSAPTween | null>(null)

  // === Video oluşturma ===
  useEffect(() => {
    const vid = document.createElement("video")
    vid.crossOrigin = "anonymous"
    vid.loop = true
    vid.muted = true
    vid.playsInline = true
    vid.preload = "auto"
    vid.autoplay = true
    vid.style.display = "none"
    document.body.appendChild(vid)
    videoRef.current = vid

    const texture = new THREE.VideoTexture(vid)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.colorSpace = THREE.SRGBColorSpace

    if (materialRef.current?.uniforms?.uTexture)
      materialRef.current.uniforms.uTexture.value = texture

    materialRef.current.needsUpdate = true

    return () => {
      vid.pause()
      vid.remove()
    }
  }, [])

  // === Flip animasyonu ve video değişimi ===
  useEffect(() => {
    if (!meshRef.current || !videoRef.current) return

    const direction = centerIndex > lastCenterIndex.current ? 1 : -1
    const rotationDelta = direction * Math.PI
    lastCenterIndex.current = centerIndex

    let videoSwitched = false

    tweenRef.current?.kill()
    tweenRef.current = gsap.to(meshRef.current.rotation, {
      x: `+=${rotationDelta}`,
      duration: 0.8,
      ease: "power2.inOut",
      overwrite: "auto",
      onUpdate: () => {
        const progress = tweenRef.current?.progress() || 0

        if (!videoSwitched && progress >= 0.5) {
          videoSwitched = true
          const vid = videoRef.current!
          vid.src = frontVideoUrl
          vid.load()
          vid.play().catch(() => {})
        }
      },
    })
  }, [centerIndex, frontVideoUrl])

  // === SOL ALT KÖŞE POZİSYONU ===
  useFrame(() => {
    const mat = materialRef.current
    const vid = videoRef.current
    const mesh = meshRef.current
    if (!mat || !mesh || !vid) return

    // Uniform güncellemeleri
    mat.uniforms.uOpacity.value = opacity
    mat.uniforms.uResolution.value.set(size.width, size.height)
    mat.uniforms.uPointer.value.set(
      mouse.x * (size.width / 2) + size.width / 2,
      mouse.y * (size.height / 2) + size.height / 2
    )

    const tex = mat.uniforms.uTexture.value
    if (tex instanceof THREE.VideoTexture) tex.needsUpdate = true

    // Viewport bazlı sol alt pozisyon hesaplama
    const meshWidth = 1.3 * 1.6 // plane width * scale
    const meshHeight = 1 * 1.4  // plane height * scale

    // Viewport'un sol alt köşesine yerleştir
    // +0.1 margin ekledim ki tam kenara yapışık olmasın
    mesh.position.set(
      -viewport.width / 2 + meshWidth / 2 + 3,  // SOL
      -viewport.height / 2 + meshHeight / 2 + 1, // ALT
      1 // Z değeri
    )
  })

  const rotation = useMemo(() => [0, 0, 0], [])

  return (
    <mesh 
      ref={meshRef} 
      rotation={rotation as any}
      scale={[1.8, 1.4, 1.4]}
    >
      <planeGeometry args={[1.3, 1, 32, 32]} />
      <videoSingleMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
        uColor={new THREE.Color(data.bgColor || "#000")}
        uSize={new THREE.Vector2(settings.width, settings.height)}
        uAspectRatio={settings.width / settings.height}
        uOpacity={opacity}
        uPointer={new THREE.Vector2(0, 0)}
      />
    </mesh>
  )
}