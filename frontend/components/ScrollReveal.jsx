import React, { useEffect, useRef, useState } from 'react'

/**
 * Enhanced ScrollReveal Component
 * Supports multiple distinct animation styles (fade-up, fade-down, fade-left, fade-right, zoom-in, pop, flip-up).
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  variant = 'fade-up', // 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'pop' | 'flip-up' | 'fade'
  direction, // fallback/alias: 'up' | 'down' | 'left' | 'right'
  duration = 750,
  distance = 36,
}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  // Map legacy direction prop to variant if passed
  const effectiveVariant = direction
    ? direction === 'up'
      ? 'fade-up'
      : direction === 'down'
      ? 'fade-down'
      : direction === 'left'
      ? 'fade-left'
      : direction === 'right'
      ? 'fade-right'
      : variant
    : variant

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    )

    observer.observe(element)

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])

  // Dynamic transform calculations per variant
  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0) scale(1) rotateX(0deg)'
    switch (effectiveVariant) {
      case 'fade-up':
        return `translate3d(0, ${distance}px, 0)`
      case 'fade-down':
        return `translate3d(0, -${distance}px, 0)`
      case 'fade-left': // Enters from right to left
        return `translate3d(${distance + 15}px, 0, 0)`
      case 'fade-right': // Enters from left to right
        return `translate3d(-${distance + 15}px, 0, 0)`
      case 'zoom-in': // Expands smoothly from center-up
        return 'translate3d(0, 20px, 0) scale(0.92)'
      case 'pop': // Bouncy scale pop for stats/badges
        return 'scale(0.82)'
      case 'flip-up': // 3D card tilt
        return 'perspective(1000px) rotateX(12deg) translate3d(0, 28px, 0)'
      case 'fade':
      default:
        return 'translate3d(0, 0, 0)'
    }
  }

  return (
    <div
      ref={ref}
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
      className={className}
    >
      {children}
    </div>
  )
}
