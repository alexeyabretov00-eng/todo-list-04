/**
 * T069 – ReorderList component
 * A lightweight custom drag-and-drop list for manual ordering.
 *
 * Justification: Ant Design's drag-sort is a Table variant, unsuitable for plain
 * ordered lists. This custom component uses the HTML5 Drag and Drop API — no external
 * DnD library required, consistent with constitution §V. Per constitution §V, a
 * custom component is justified here.
 *
 * Usage:
 *   <ReorderList
 *     items={[{ id: '1', content: <span>Item A</span> }, ...]}
 *     onReorder={(orderedIds) => dispatch(reorderItems(orderedIds))}
 *   />
 */

import React, { useRef, useState } from 'react';

import { DragHandle, ReorderListContainer, ReorderListItem } from './ReorderList.styled';

export interface ReorderListItemData {
  /** Unique identifier for the item — used to produce the new ordered-IDs array on drop. */
  id: string;
  /** Rendered content for the row. */
  content: React.ReactNode;
}

interface ReorderListProps {
  items: ReorderListItemData[];
  /** Called with the new ordered array of IDs after the user completes a drag. */
  onReorder: (orderedIds: string[]) => void;
}

export function ReorderList({ items, onReorder }: ReorderListProps): React.ReactElement {
  const [localItems, setLocalItems] = useState(items);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  // Sync local items when the prop changes (e.g., after a server round-trip)
  React.useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleDragStart = (id: string) => {
    setDraggingId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragOverId.current = id;
  };

  const handleDrop = () => {
    if (!draggingId || !dragOverId.current || draggingId === dragOverId.current) {
      setDraggingId(null);
      return;
    }

    const from = localItems.findIndex((item) => item.id === draggingId);
    const to = localItems.findIndex((item) => item.id === dragOverId.current);

    const reordered = [...localItems];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    setLocalItems(reordered);
    setDraggingId(null);
    dragOverId.current = null;

    onReorder(reordered.map((item) => item.id));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  return (
    <ReorderListContainer>
      {localItems.map((item) => (
        <ReorderListItem
          key={item.id}
          $isDragging={draggingId === item.id}
          draggable
          onDragStart={() => handleDragStart(item.id)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          aria-label={`Reorderable item ${item.id}`}
        >
          <DragHandle aria-hidden="true" title="Drag to reorder">
            ⠿
          </DragHandle>
          {item.content}
        </ReorderListItem>
      ))}
    </ReorderListContainer>
  );
}
