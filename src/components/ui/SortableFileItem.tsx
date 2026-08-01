"use client";
import { formatFileSize } from "@/lib/fileUtils";
import { CSS } from "@dnd-kit/utilities";
import {
  useSortable,
} from "@dnd-kit/sortable";

import { Trash2, GripVertical } from "lucide-react";

type Props = {
  file: File;
  index: number;
  onRemove: (index: number) => void;
};

export default function SortableFileItem({
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
      className={`flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 ${
        isDragging
          ? "z-10 cursor-grabbing border-blue-200 opacity-90 shadow-lg ring-2 ring-blue-400"
          : "cursor-grab border-gray-200/70 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md active:shadow-lg"
      }`}
    >
      <div className="flex items-center gap-4">

        <div className="text-gray-400">
          <GripVertical size={20} />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900">
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
        className="rounded-lg p-2 text-red-500 transition-colors duration-200 hover:bg-red-50"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
