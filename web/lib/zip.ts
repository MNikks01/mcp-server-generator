import JSZip from "jszip";

// Turn the generated file map into a downloadable zip (server-side, Node buffer).
export async function zipFiles(name: string, files: Record<string, string>): Promise<Buffer> {
  const zip = new JSZip();
  const folder = zip.folder(name) ?? zip;
  for (const [path, content] of Object.entries(files)) {
    folder.file(path, content);
  }
  return zip.generateAsync({ type: "nodebuffer" });
}
