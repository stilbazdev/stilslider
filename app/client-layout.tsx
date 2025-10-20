"use client";
import { Canvas } from "@react-three/fiber";
import { WrappedCarousel } from "./components/Carousel";
import { CarouselProvider } from "./components/context";
import { useRef, useState, useEffect } from "react";
import { SplitScreenLayout } from "./components/SplitScreenLayout";
import { CCursor } from "./components/cursor";
import { CursorManager } from "./components/CursorManager"; // import ettik

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollInstanceRef = useRef<any>(null);
  const [currentColor, setCurrentColor] = useState<string>("transparent");

  // Mouse pozisyonu
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!scrollRef.current) return;

    import("locomotive-scroll").then((mod) => {
      const LocomotiveScroll = mod.default;
      import("locomotive-scroll/dist/locomotive-scroll.css");

      scrollInstanceRef.current = new LocomotiveScroll({
        el: scrollRef.current!,
        smooth: true,
        lerp: 0.07,
        multiplier: 1.2,
        smartphone: { smooth: true, breakpoint: 768 },
        tablet: { smooth: true, breakpoint: 1024 },
      });

      scrollInstanceRef.current.on("scroll", (args: any) => {
        console.log("Scroll position:", args.scroll.y);
      });
    });

    return () => scrollInstanceRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;

    const observer = new ResizeObserver(() => {
      scrollInstanceRef.current?.update();
      console.log("Measured scrollHeight:", scrollRef.current?.scrollHeight);
    });

    observer.observe(scrollRef.current);

    return () => observer.disconnect();
  }, [children]);

  // Mouse hareketini yakalama
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <CarouselProvider>
      <div className="w-screen h-screen relative">
        {/* Arka Plan */}
        <div
          ref={backgroundRef}
          className="fixed top-0 left-0 w-full h-full pointer-events-none transition-colors duration-[1500ms]"
          style={{ backgroundColor: currentColor, zIndex: 0 }}
        />

        {/* 3D Canvas */}
        <Canvas className="absolute stil-canvas">
          <WrappedCarousel onColorChange={setCurrentColor} />
        </Canvas>

        <SplitScreenLayout />

        {/* Locomotive Scroll Container */}
        <div
          ref={scrollRef}
          data-scroll-container
          className="absolute w-full z-20 no-pointer-layer"
          style={{ perspective: "1px", left: 0, top: 0 }}
        >
          <div data-scroll-section className="relative no-pointer-layer" style={{ minHeight: "100vh" }}>
            <div className="relative no-pointer-layer">{children}</div>
          </div>
        </div>

        {/* Custom Cursor */}
  
          <CursorManager />
      
      </div>
    </CarouselProvider>
  );
}
