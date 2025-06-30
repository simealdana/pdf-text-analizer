export interface MetadataFlagsDto {
  includeMetadata?: boolean;
  textLimit?: number;
}

export interface ExtractInfoMetadataDto extends MetadataFlagsDto {
  includeMetadata?: boolean;
  textLimit?: number; // Default: 4000 characters
}

export interface ExtractPagesMetadataDto extends MetadataFlagsDto {
  includeMetadata?: boolean;
  textLimit?: number; // Default: 2000 characters per page
}
