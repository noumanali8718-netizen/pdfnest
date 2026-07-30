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
      className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-4">

        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400"
        >
          <GripVertical size={20} />
        </div>

        <div>
          <p className="font-medium">
            📄 {file.name}
          </p>

          <p className="text-sm text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>

      <button
        onClick={() => onRemove(index)}
        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}