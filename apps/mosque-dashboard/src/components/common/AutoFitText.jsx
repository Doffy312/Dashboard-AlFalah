import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';

/**
 * AutoFitText component
 * Precisely adjusts font size to be as large as possible (up to maxFontSize),
 * only scaling down smoothly when content would otherwise overflow the container width.
 * Prevents unnecessary shrinking, avoids excess blank space, and eliminates text clipping/ellipsis.
 *
 * @param {React.ReactNode} children - Text or number to display
 * @param {number} maxFontSize - Maximum font size in pixels (default: 24)
 * @param {number} minFontSize - Minimum font size in pixels (default: 12)
 * @param {string} className - Additional CSS classes
 * @param {string} as - Element tag name ('div', 'h3', 'span', etc.)
 */
export default function AutoFitText({
  children,
  maxFontSize = 24,
  minFontSize = 12,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  const calculateFit = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const availableWidth = container.clientWidth;
    if (availableWidth <= 0) return;

    const textContent = String(children ?? '');
    if (!textContent) {
      setFontSize(maxFontSize);
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      const style = window.getComputedStyle(container);
      const fontWeight = style.fontWeight || '700';
      const fontFamily = style.fontFamily || 'Inter, -apple-system, sans-serif';

      // Measure exact text width at maxFontSize
      context.font = `${fontWeight} ${maxFontSize}px ${fontFamily}`;
      const textWidthAtMax = context.measureText(textContent).width;

      // If it fits at maxFontSize, use maxFontSize (maximizes text size, no empty space)
      if (textWidthAtMax <= availableWidth) {
        setFontSize(maxFontSize);
        return;
      }

      // If text overflows, scale down just enough to fit snugly with 2px subpixel buffer
      const usableWidth = Math.max(0, availableWidth - 2);
      const ratio = usableWidth / textWidthAtMax;
      const exactSize = Math.round(maxFontSize * ratio * 10) / 10;
      const clampedSize = Math.max(minFontSize, Math.min(maxFontSize, exactSize));

      setFontSize(clampedSize);
    } catch {
      setFontSize(maxFontSize);
    }
  }, [children, maxFontSize, minFontSize]);

  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    calculateFit();

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const observer = new ResizeObserver(() => {
        calculateFit();
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [calculateFit]);

  return (
    <div ref={containerRef} className="w-full min-w-0 overflow-hidden">
      <Component
        className={`whitespace-nowrap tracking-tight ${className}`}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1.25 }}
        {...props}
      >
        {children}
      </Component>
    </div>
  );
}
