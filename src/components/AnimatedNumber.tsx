import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1500,
  className,
  formatter = (val) => Math.round(val).toLocaleString()
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const end = value;
          const startTime = Date.now();

          const frame = () => {
            const now = Date.now();
            const progress = (now - startTime) / duration;
            const current = start + (end - start) * Math.min(progress, 1);

            setDisplayValue(current);

            if (progress < 1) {
              requestAnimationFrame(frame);
            } else {
                setDisplayValue(end); // Ensure it ends on the exact value
            }
          };
          requestAnimationFrame(frame);
          observer.disconnect(); // Animate only once
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [value, duration]);

  return <span ref={elementRef} className={className}>{formatter(displayValue)}</span>;
};

export default AnimatedNumber;
