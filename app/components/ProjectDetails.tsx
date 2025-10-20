// components/ProjectDetails.tsx
"use client"

import React, { useRef, useEffect } from 'react'
import { useCarousel } from './context'
import gsap from 'gsap'
import Link from 'next/link'

interface ProjectDetailsProps {
  projectData: {
    title: string
    description: string
    slug: string
  }[]
}

export function ProjectDetails({ projectData }: ProjectDetailsProps) {
  const { activeIndex } = useCarousel()
  const contentRef = useRef<HTMLDivElement>(null)

  const currentProject =
    activeIndex !== null && projectData[activeIndex]
      ? projectData[activeIndex]
      : null

  useEffect(() => {
    if (!contentRef.current) return

    if (currentProject) {
      gsap.to(contentRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3
      })
    } else {
      gsap.to(contentRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in'
      })
    }
  }, [currentProject])

  if (!currentProject) return null

  return (
    <div
      ref={contentRef}
      className="text-white p-8"
      style={{
        transform: 'translateY(50px)',
        opacity: 0
      }}
    >
      <div className="mb-6">
        <h1 className="text-5xl font-bold mb-4">{currentProject.title}</h1>
      </div>
      
      <div className="mb-8">
        <p className="text-lg leading-relaxed">{currentProject.description}</p>
      </div>
      
      <div>
        <Link
          href={`/projects/${currentProject.slug}`}
          className="inline-flex items-center text-lg group hover:opacity-80 transition-opacity"
        >
          <span className="mr-3">Open case study</span>
          <div className="transform group-hover:translateX-2 transition-transform">
            <svg width="17" height="14" viewBox="0 0 17 14" className="fill-current">
              <path d="M0,7.5v-1C0,6.2,0.2,6,0.5,6h13.2L9.2,1.6C9.1,1.5,9.1,1.3,9.1,1.2s0.1-0.3,0.1-0.4l0.7-0.7 C10,0.1,10.2,0,10.3,0s0.3,0.1,0.4,0.1l6.1,6.1C16.9,6.4,17,6.6,17,6.8v0.4c0,0.2-0.1,0.4-0.2,0.5l-6.1,6.1 c-0.1,0.1-0.2,0.1-0.4,0.1s-0.3-0.1-0.4-0.1l-0.7-0.7c-0.1-0.1-0.1-0.2-0.1-0.4c0-0.1,0.1-0.3,0.1-0.3L13.7,8H0.5 C0.2,8,0,7.8,0,7.5z"/>
            </svg>
          </div>
        </Link>
      </div>
    </div>
  )
}
