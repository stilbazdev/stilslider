"use client"

import { useEffect, useState } from "react"

export function useProjects() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch("/api/projects", { cache: "no-store" })
                const data = await res.json()
                setProjects(data)
            } catch (err) {
                console.error("Projects fetch error:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    return { projects, loading }
}
