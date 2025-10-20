"use client";
import React, { useEffect, useRef } from "react";
import { CCursor } from "./cursor";

export const CursorManager = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cursorRef.current) return;
    const cursorEl = cursorRef.current;

    const cursorsMap: Record<string, string> = {
      none: "button, .c-badges u",
      link: "a, .js-link, .slide-title",
      text: "input[type='text'], textarea",
      drag: ".c-drag",
      prev: "[class*='__prev']",
      next: "[class*='__next']",
    };

    const setCursorState = (state: string) => {
      cursorEl.classList.remove(
        "m-none",
        "m-link",
        "m-text",
        "m-drag",
        "m-prev",
        "m-next"
      );
      if (state) cursorEl.classList.add(`m-${state}`);
    };

    

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      for (const [state, selector] of Object.entries(cursorsMap)) {
        if (target.matches(selector) || target.closest(selector)) {
          setCursorState(state);
          return;
        }
      }
      setCursorState("none");
    };

    const handleMouseMove = (e: MouseEvent) => {
      const offsetX = cursorEl.offsetWidth / 2;
      const offsetY = cursorEl.offsetHeight / 2;

      cursorEl.style.display = "block"; // mouse görünür olunca
      cursorEl.style.transform = `translate3d(${e.clientX - offsetX}px, ${
        e.clientY - offsetY
      }px, 0)`;
    };

    const handleMouseLeaveWindow = () => {
      cursorEl.style.display = "none"; // mouse ekrandan çıkarsa gizle
    };

    document.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", (e) => {
      // mouse window dışına çıkarsa
      if (!e.relatedTarget && !e.toElement) handleMouseLeaveWindow();
    });

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeaveWindow);
    };
  }, []);

  return <CCursor ref={cursorRef} />;
};
