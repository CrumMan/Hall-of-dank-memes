import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import type { Meme } from "../data/types";
import { MemeCard } from "./MemeCard";

interface SortableGridProviderProps {
  ids: string[];
  onReorder: (orderedIds: string[]) => void;
  children: ReactNode;
}

/** Wraps the podium + gallery in one continuous dnd-kit sortable context. */
export function SortableGridProvider({ ids, onReorder, children }: SortableGridProviderProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

interface SortableMemeCardProps {
  meme: Meme;
  rank: number;
  size?: "normal" | "large";
}

/** A MemeCard that becomes draggable within a SortableGridProvider. */
export function SortableMemeCard({ meme, rank, size = "normal" }: SortableMemeCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: meme.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <MemeCard meme={meme} rank={rank} size={size} reordering dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}
