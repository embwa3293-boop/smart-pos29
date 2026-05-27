import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FluidTextProps {
  text: string;
  className?: string;
  staggerDelay?: number;
  duration?: number;
}

export default function FluidText({
  text,
  className = '',
  staggerDelay = 0.05,
  duration = 0.6,
}: FluidTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll('.fluid-char');

    gsap.set(chars, { opacity: 0, y: 20 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration,
          stagger: staggerDelay,
          ease: 'power2.out',
        });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [text, staggerDelay, duration]);

  const characters = text.split('');

  return (
    <div ref={containerRef} className={className}>
      {characters.map((char, index) => (
        <span
          key={index}
          className="fluid-char inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
}
