import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  suffix?: string;
}

export default function StatCard({ title, value, trend, trendLabel, icon: Icon, suffix = '' }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (value - startValue) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value]);

  const isPositive = (trend || 0) >= 0;

  return (
    <div
      ref={cardRef}
      className="bg-surface border border-[rgba(192,192,192,0.1)] rounded-xl p-6 shadow-elevated hover:border-[rgba(192,192,192,0.25)] transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-silver/60 font-body">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-[rgba(192,192,192,0.08)] flex items-center justify-center group-hover:bg-[rgba(192,192,192,0.15)] transition-colors duration-300">
          <Icon size={20} className="text-silver" />
        </div>
      </div>

      <div className="text-[32px] font-semibold text-silver font-body tabular-nums">
        {displayValue.toLocaleString('ar-EG')}{suffix}
      </div>

      {trend !== undefined && trendLabel && (
        <div className="flex items-center gap-1.5 mt-2">
          {isPositive ? (
            <TrendingUp size={14} className="text-emerald-400" />
          ) : (
            <TrendingDown size={14} className="text-red-400" />
          )}
          <span className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-silver/40">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
