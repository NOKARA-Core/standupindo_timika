"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface AnimateRevealProps {
  children: ReactNode;
  className?: string;
  variant?: "fade-up" | "slide-left" | "zoom-in" | "fade";
  delayMs?: number;
  durationMs?: number;
}

export function AnimateReveal({
  children,
  className = "",
  variant = "fade-up",
  delayMs = 0,
  durationMs = 650,
}: AnimateRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) observer.unobserve(domRef.current);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const currentElem = domRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, []);

  // Compute transform & opacity styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "slide-left":
        return isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-10";
      case "zoom-in":
        return isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-[0.96] translate-y-4";
      case "fade":
        return isVisible ? "opacity-100" : "opacity-0";
      case "fade-up":
      default:
        return isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-[0.98]";
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delayMs}ms`,
      }}
      className={`transition-all will-change-[transform,opacity] ${getVariantStyles()} ${className}`}
    >
      {children}
    </div>
  );
}
