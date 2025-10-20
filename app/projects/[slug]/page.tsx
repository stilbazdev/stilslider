"use client"

import React, { useEffect, useState } from "react"
import BackButton from "../../components/BackButton"
import { useProjects } from "../../hooks/useProjects"

interface Project {
  id: number
  title: string
  slug: string
  description: string
  content?: string
  image?: string
  color?: string
  bgColor?: string
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function ProjectPage({ params }: PageProps) {
  const { projects, loading } = useProjects()
  const [project, setProject] = useState<Project | null>(null)
  const [slug, setSlug] = useState<string>("")

  // params'ı async olarak al
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!loading && slug) {
      const found = projects.find((p) => p.slug === slug)
      if (found) {
        // içerikteki localhost url'leri değiştir
        const fixedContent = found.content?.replaceAll(
          "http://localhost/ruzgar",
          "https://ruzgar.com" // kendi domainin
        )
        setProject({ ...found, content: fixedContent })
      } else {
        setProject(null)
      }
    }
  }, [projects, loading, slug])

  if (loading || !project) {
    return (
      <div className="p-8 text-gray-200 text-xl font-semibold">
        {loading ? "Loading..." : "Project not found"}
      </div>
    )
  }

  return (
    <div className="relative pointer-layer">
      {/* Geri butonu */}
      <div className="absolute top-8 left-8 z-50">
        <BackButton />
      </div>

      {/* Üst boş alan */}
      <div className="relative top-0 left-0 w-full h-screen" style={{ zIndex: 10 }}></div>

      {/* İçerik */}
      <div className="relative z-10 p-8 text-gray-200 max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">{project.title}</h1>

        {/* ✅ WordPress içeriğini HTML olarak göster */}
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: project.content || "" }}
        />

        {/* Kapak görseli */}
        {project.image && (
          <img
            src={project.image}
            alt={project.title}
            className="mt-8 rounded-lg w-full object-cover"
          />
        )}
      </div>
    </div>
  )
}
