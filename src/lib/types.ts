// Stable client-side identifier for an uploaded file.
// Using a unique id (rather than file.name + index) keeps dnd-kit sorting
// reliable even when files share the same name, have similar names,
// or are reordered/removed repeatedly.
export type FileItem = {
  id: string;
  file: File;
};

let idCounter = 0;

// Generate a unique, stable id for a file item. Uniqueness is guaranteed
// within the current session by combining a timestamp with a counter.
export function generateFileId(): string {
  idCounter += 1;
  return `file-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}
