"use client";

import { useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type DragHandleProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Vertical drag-and-drop list (mouse, touch and keyboard: focus the handle, Space, arrows, Space).
 * Reorders optimistically and reports the new id order via `onReorder`.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  disabled,
  className,
}: {
  items: T[];
  onReorder: (ids: string[]) => void;
  renderItem: (item: T, handle: React.ReactNode, dragging: boolean) => React.ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const [order, setOrder] = useState(items);
  // Re-sync when the server sends a new list (after revalidation), without an effect.
  const [source, setSource] = useState(items);
  if (source !== items) {
    setSource(items);
    setOrder(items);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = order.findIndex((i) => i.id === active.id);
    const to = order.findIndex((i) => i.id === over.id);
    const next = arrayMove(order, from, to);
    setOrder(next);
    onReorder(next.map((i) => i.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order.map((i) => i.id)} strategy={verticalListSortingStrategy} disabled={disabled}>
        <ul className={cn("grid gap-2", className)}>
          {order.map((item) => (
            <SortableRow key={item.id} id={item.id} disabled={disabled} render={(handle, dragging) => renderItem(item, handle, dragging)} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, disabled, render }: { id: string; disabled?: boolean; render: (handle: React.ReactNode, dragging: boolean) => React.ReactNode }) {
  const t = useTranslations("dashboard.common");
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={t("dragToReorder")}
      title={t("dragToReorder")}
      disabled={disabled}
      className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
    >
      <GripVerticalIcon className="size-4" />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("relative", isDragging && "z-10 opacity-90 [&>*]:shadow-xl [&>*]:ring-1 [&>*]:ring-brand/40")}
    >
      {render(handle, isDragging)}
    </li>
  );
}
