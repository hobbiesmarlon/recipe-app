import React, { useState, useEffect, useRef } from 'react';

interface SortableListProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  renderItem: (item: T, index: number, dragHandleProps: any) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
  className?: string;
}

export function SortableList<T>({ 
  items, 
  onReorder, 
  renderItem, 
  keyExtractor, 
  className = "space-y-3" 
}: SortableListProps<T>) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [activeItems, setActiveItems] = useState<T[]>(items);
  const lastMoveTime = useRef(0);

  // Sync local state with props when not dragging
  useEffect(() => {
    if (draggingIndex === null) {
      setActiveItems(items);
    }
  }, [items, draggingIndex]);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>, index: number) => {
    // Ignore drag if clicking on an interactive element
    const target = e.target as HTMLElement;
    if (target.closest('button, input, textarea, select, a')) {
      return;
    }

    e.preventDefault(); // Prevent default touch actions like scroll
    setDraggingIndex(index);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (draggingIndex !== null) {
        onReorder(activeItems);
    }
    setDraggingIndex(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (draggingIndex === null) return;

    // Simple throttle to ~60fps
    const now = Date.now();
    if (now - lastMoveTime.current < 16) return;
    lastMoveTime.current = now;

    // Use elementFromPoint to find the list item we are hovering over
    // We look for elements with the data-index attribute
    const elementUnder = document.elementFromPoint(e.clientX, e.clientY);
    const listItem = elementUnder?.closest('li[data-index]');
    
    if (listItem) {
      const newIndex = parseInt(listItem.getAttribute('data-index') || '-1', 10);
      
      if (newIndex !== -1 && newIndex !== draggingIndex) {
         const copy = [...activeItems];
         const [removed] = copy.splice(draggingIndex, 1);
         copy.splice(newIndex, 0, removed);
         
         // Update local list state
         setActiveItems(copy);
         // Update tracking index to the new position
         setDraggingIndex(newIndex);
      }
    }
  };

  return (
    <ul className={className}>
      {activeItems.map((item, index) => (
        <li
          key={keyExtractor(item)}
          data-index={index}
          className={`transition-all duration-200 ease-in-out ${draggingIndex === index ? 'opacity-95 z-10 scale-[1.02] shadow-2xl ring-2 ring-primary rounded-lg outline-none' : ''}`}
        >
          {renderItem(item, index, {
            onPointerDown: (e: React.PointerEvent<HTMLElement>) => handlePointerDown(e, index),
            onPointerMove: handlePointerMove,
            onPointerUp: handlePointerUp,
            style: { touchAction: 'none', cursor: 'grab', userSelect: 'none' }
          })}
        </li>
      ))}
    </ul>
  );
}