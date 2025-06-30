export class PdfTextResponseDto {
  success: boolean;
  message: string;
  data: {
    filename: string;
    size: number;
    extractedText: string;
    characterCount: number;
    wordCount: number;
  };
}

export class PdfInfoResponseDto {
  success: boolean;
  message: string;
  data: {
    filename: string;
    size: number;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  };
}

export class PdfPageInfoDto {
  page: number;
  text: string;
  metadata: {
    pageInfo: any;
    pageMetadata: any;
    numrender: number;
    version: string;
    totalPages: number;
    pageNumber: number;
    characterCount: number;
    wordCount: number;
  };
  nextPage: number | null;
}

export class PdfPagesResponseDto {
  success: boolean;
  message: string;
  data: {
    filename: string;
    size: number;
    totalPages: number;
    pages: PdfPageInfoDto[];
  };
}
