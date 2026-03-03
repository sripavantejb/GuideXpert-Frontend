import { useRef, useState, useLayoutEffect } from 'react';

export default function DayTabs({
  days,
  activeDay,
  onDayChange,
  completedCountForDay,
  totalSessionsForDay,
}) {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateIndicator = () => {
    const container = containerRef.current;
    const activeEl = tabRefs.current[activeDay];
    if (!container || !activeEl) return;
    const cRect = container.getBoundingClientRect();
    const aRect = activeEl.getBoundingClientRect();
    setIndicatorStyle({
      left: aRect.left - cRect.left + container.scrollLeft,
      width: aRect.width,
    });
  };

  useLayoutEffect(() => {
    updateIndicator();
  }, [activeDay, days]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(updateIndicator);
    ro.observe(container);
    const onScroll = () => updateIndicator();
    container.addEventListener('scroll', onScroll);
    return () => {
      ro.disconnect();
      container.removeEventListener('scroll', onScroll);
    };
  }, [activeDay]);

  return (
    <nav
      ref={containerRef}
      className="relative flex items-baseline gap-6 sm:gap-8 overflow-x-auto overflow-y-hidden pb-1 min-h-0 border-b border-gray-200/80"
      style={{ WebkitOverflowScrolling: 'touch' }}
      aria-label="Training days"
    >
      {days.map((day) => {
        const isActive = activeDay === day.id;
        const completed = completedCountForDay(day.id) ?? 0;
        const total = totalSessionsForDay(day.id) ?? 0;

        return (
          <button
            key={day.id}
            ref={(r) => (tabRefs.current[day.id] = r)}
            type="button"
            onClick={() => onDayChange(day.id)}
            className={`
              relative shrink-0 py-3 px-0.5 transition-colors duration-200 whitespace-nowrap
              focus:outline-none focus-visible:ring-0 focus-visible:underline focus-visible:underline-offset-4 focus-visible:decoration-2
              ${isActive ? 'text-primary-navy font-semibold' : 'text-gray-500 hover:text-gray-800 font-medium'}
            `}
          >
            <span className="text-sm">{day.label}</span>
            <span className="ml-1.5 text-xs text-gray-400 tabular-nums font-normal">{completed}/{total}</span>
          </button>
        );
      })}
      {/* Sliding indicator */}
      <span
        className="absolute bottom-0 h-0.5 bg-primary-navy rounded-full transition-all duration-200 ease-out pointer-events-none"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        aria-hidden
      />
    </nav>
  );
}
