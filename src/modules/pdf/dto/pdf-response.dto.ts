export interface PdfTextResponseDto {
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

export interface PdfDetailedInfoDto {
  numpages: number;
  numrender: number;
  info: any;
  metadata: any;
  text: string;
  version: string | null;
  generatedMetadata: any;
  warning?: string;
}

export interface PdfInfoResponseDto {
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
    version: string | null;
    generatedMetadata: any;
    warning?: string;
  };
}

export interface PdfPageMetadataDto {
  pageInfo: any;
  pageMetadata: any;
  numrender: number | null;
  version: string | null;
  totalPages: number;
  pageNumber: number;
  characterCount: number;
  wordCount: number;
  generatedMetadata: any;
}

export interface PdfPageDto {
  page: number;
  text: string;
  metadata: PdfPageMetadataDto;
  nextPage: number | null;
}

export interface PdfPagesResponseDto {
  success: boolean;
  message: string;
  data: {
    filename: string;
    size: number;
    totalPages: number;
    pages: PdfPageDto[];
  };
}
