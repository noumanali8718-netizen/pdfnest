"use client";
import { memo } from "react";
import { formatFileSize } from "@/lib/fileUtils";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import { Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

type Props = {
  id: string;
  file: File;
  index: number;
  totalItems: number;
  onRemove: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

function SortableFileItemBase({
  id,
  file,
  index,
  totalItems,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all duration-150 ${
        isDragging
          ? "z-10 scale-[1.02] cursor-grabbing border-blue-200 opacity-90 shadow-xl shadow-blue-100 ring-2 ring-blue-400"
          : "cursor-grab border-gray-200/70 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md active:shadow-lg"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="shrink-0 text-gray-400">
          <GripVertical size={20} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            📄 {file.name}
          </p>

          <p className="mt-0.5 text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {/* Move up — provides a keyboard/pointer-friendly way to reorder
            without relying solely on drag-and-drop. */}
        <button
          onClick={() => onMoveUp(index)}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={index === 0}
          aria-label={`Move ${file.name} up`}
          className="rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronUp size={18} />
        </button>

        {/* Move down */}
        <button
          onClick={() => onMoveDown(index)}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={index === totalItems - 1}
          aria-label={`Move ${file.name} down`}
          className="rounded-lg p-2 text-gray-500 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronDown size={18} />
        </button>

        <button
          onClick={() => onRemove(id)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Remove ${file.name}`}
          className="rounded-lg p-2 text-red-500 transition-colors duration-150 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

// Memoized: file and id are stable, so items only need to re-render
// when their index, totals, or the callbacks change.
export default memo(SortableFileItemBase, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.file === next.file &&
    prev.index === next.index &&
    prev.totalItems === next.totalItems &&
    prev.onRemove === next.onRemove &&
    prev.onMoveUp === next.onMoveUp &&
    prev.onMoveDown === next.onMoveDown
  );
});
