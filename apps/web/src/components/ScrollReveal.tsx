"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: "slide-left" | "pop-up";
  delayMs?: number;
}

export function ScrollReveal({
  children,
  className = "",
  variant = "pop-up",
  delayMs = 0,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If IntersectionObserver is unavailable, fallback immediately
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
        threshold: 0.1,
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

  const variantStyles =
    variant === "slide-left"
      ? isVisible
        ? "opacity-100 translate-x-0"
        : "opacity-0 -translate-x-8"
      : isVisible
      ? "opacity-100 scale-100 translate-y-0"
      : "opacity-0 scale-95 translate-y-6";

  return (
    <div
      ref={domRef}
      style={{
        transitionDuration: "200ms",
        transitionTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
        transitionDelay: `${delayMs}ms`,
      }}
      className={`transition-all ${variantStyles} ${className}`}
    >
      {children}
    </div>
  );
}
