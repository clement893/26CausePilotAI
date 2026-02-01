'use client';

/**
 * DashboardGrid - Grille réactive avec drag & drop (react-grid-layout).
 * Sauvegarde et restaure le layout par utilisateur.
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout/legacy';
import type { Layout } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export interface DashboardGridProps {
  /** Layout initial (positions x, y, w, h des items) */
  initialLayout: Layout;
  /** Callback quand le layout change (pour sauvegarder) */
  onLayoutChange?: (layout: Layout) => void;
  children: React.ReactNode;
  /** Mode édition (drag/drop actif) */
  isEditable?: boolean;
  /** Nombre de colonnes */
  cols?: number;
  /** Row height en px */
  rowHeight?: number;
}

const DEFAULT_COLS = 12;
const DEFAULT_ROW_HEIGHT = 80;

export function DashboardGrid({
  initialLayout,
  onLayoutChange,
  children,
  isEditable = false,
  cols = DEFAULT_COLS,
  rowHeight = DEFAULT_ROW_HEIGHT,
}: DashboardGridProps) {
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const [width, setWidth] = useState(1200);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.contentRect.width) setWidth(entry.contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      setLayout(newLayout);
      onLayoutChange?.(newLayout);
    },
    [onLayoutChange]
  );

  return (
    <div ref={containerRef} className="w-full">
      <GridLayout
        className="layout"
        layout={layout}
        onLayoutChange={handleLayoutChange}
        width={width}
        cols={cols}
        rowHeight={rowHeight}
        isDraggable={isEditable}
        isResizable={isEditable}
        draggableHandle=".cursor-move"
        compactType="vertical"
        preventCollision={false}
      >
        {children}
      </GridLayout>
    </div>
  );
}
