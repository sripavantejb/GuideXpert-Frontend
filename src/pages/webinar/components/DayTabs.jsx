import { useRef, useState, useLayoutEffect } from 'react';

export default function DayTabs({
  days,
  activeDay,
  onDayChange,
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
    <div
      ref={containerRef}
      className="relative flex justify-center items-center gap-2 sm:gap-6 overflow-x-auto overflow-y-hidden pb-2 min-h-0 pl-2 pr-2 sm:pl-0 sm:pr-0 scroll-px-4"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {days.map((day) => {
        const isActive = activeDay === day.id;

        return (
          <button
            key={day.id}
            ref={(r) => (tabRefs.current[day.id] = r)}
            type="button"
            onClick={() => onDayChange(day.id)}
            className={`
              relative shrink-0 flex items-center justify-center min-h-[44px] py-2 px-4 sm:px-6 transition-colors duration-200 whitespace-nowrap
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2 focus-visible:rounded
              ${isActive ? 'text-primary-navy font-semibold' : 'text-gray-500 hover:text-gray-800 font-medium'}
            `}
          >
            <span className="text-sm leading-tight">{day.label}</span>
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
    </div>
  );
}
