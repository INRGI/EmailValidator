export const cleanFolderName = (name: string) =>
  name
    .replace(/[^\w\s]/g, '')
    .split(' ')[0]
    .trim();
