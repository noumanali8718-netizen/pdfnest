export function formatFileSize(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}