declare module 'pdf-parse' {
  interface PdfParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info?: Record<string, any>;
    metadata?: Record<string, any>;
    version?: string;
  }

  const pdfParse: (buffer: Buffer) => Promise<PdfParseResult>;
  export default pdfParse;
}
