"use client";
import { memo } from "react";
import { formatFileSize } from "@/lib/fileUtils";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import { Trash2, GripVertical } from "lucide-react";

type Props = {
  file: File;
  index: number;
  onRemove: (index: number) => void;
};

function SortableFileItemBase({
  file,
  index,
  onRemove,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: file.name + index,
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
      className={`flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-all duration-150 ${
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

      <button
        onClick={() => onRemove(index)}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Remove ${file.name}`}
        className="ml-2 shrink-0 rounded-lg p-2.5 text-red-500 transition-colors duration-150 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

// Memoized: file name/size are stable, so items only need to re-render
// when their index or the remove handler changes.
export default memo(SortableFileItemBase, (prev, next) => {
  return (
    prev.file === next.file &&
    prev.index === next.index &&
    prev.onRemove === next.onRemove
  );
});
