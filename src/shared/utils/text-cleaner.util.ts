export function cleanText(text: string): string {
  return text
    .replace(/[\n\r\t\f\v]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitTextByPages(text: string, totalPages: number): string[] {
  const words = text.split(' ').filter((word) => word.length > 0);
  const wordsPerPage = Math.ceil(words.length / totalPages);

  const pages: string[] = [];

  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * wordsPerPage;
    const endIndex = Math.min(startIndex + wordsPerPage, words.length);
    const pageWords = words.slice(startIndex, endIndex);
    pages.push(pageWords.join(' '));
  }

  return pages;
}
