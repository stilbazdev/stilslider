// page.tsx
"use client"


import { SplitScreenLayout } from "./components/SplitScreenLayout"
import { TitleList } from "./components/TitleList"
import { ProjectWrapper } from "./components/ProjectWrapper"

export default function Home() {
  return (
   
      <ProjectWrapper>
        
        <TitleList />
      </ProjectWrapper>
   
  )
}