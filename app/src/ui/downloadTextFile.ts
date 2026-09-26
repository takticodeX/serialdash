/** Triggers a browser download of `text` as a file — shared by the console's "save as .txt"
 * (APP-CSL-09) and the dashboard's CSV/profile exports (APP-DSH-07/08). */
export function downloadTextFile(
  filename: string,
  text: string,
  mimeType = 'text/plain;charset=utf-8',
): void {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
