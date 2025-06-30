import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PdfController } from '../pdf.controller';
import { PdfService } from '../services/pdf.service';
import { MetadataService } from '../services/metadata.service';
import { UploadedPdfFile } from '../../../shared/types/upload.types';

describe('PdfController', () => {
  let controller: PdfController;

  const mockPdfFile: UploadedPdfFile = {
    fieldname: 'pdf',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    buffer: Buffer.from('fake pdf content'),
    size: 1024,
  };

  const mockPdfService = {
    extractTextFromPdf: jest.fn(),
    extractDetailedInfo: jest.fn(),
    extractPagesInfo: jest.fn(),
  };

  const mockMetadataService = {
    generateMetadata: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PdfController],
      providers: [
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
        {
          provide: MetadataService,
          useValue: mockMetadataService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<PdfController>(PdfController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('extractPdfText', () => {
    it('should extract text from PDF', async () => {
      const expectedResponse = {
        success: true,
        message: 'Text extracted successfully',
        data: {
          filename: 'test.pdf',
          size: 1024,
          extractedText: 'Sample text content',
          characterCount: 18,
          wordCount: 3,
        },
      };

      mockPdfService.extractTextFromPdf.mockResolvedValue(expectedResponse);

      const result = await controller.extractPdfText(mockPdfFile);

      expect(result).toEqual(expectedResponse);
      expect(mockPdfService.extractTextFromPdf).toHaveBeenCalledWith(
        mockPdfFile,
      );
    });
  });

  describe('extractPdfInfo', () => {
    it('should extract detailed info without metadata', async () => {
      const query = {};
      const expectedResponse = {
        success: true,
        message: 'PDF information extracted successfully',
        data: {
          filename: 'test.pdf',
          size: 1024,
          numpages: 1,
          numrender: 1,
          info: null,
          metadata: null,
          text: 'Sample text content',
          version: '1.4',
          generatedMetadata: null,
        },
      };

      mockPdfService.extractDetailedInfo.mockResolvedValue(expectedResponse);

      const result = await controller.extractPdfInfo(mockPdfFile, query);

      expect(result).toEqual(expectedResponse);
      expect(mockPdfService.extractDetailedInfo).toHaveBeenCalledWith(
        mockPdfFile,
        {
          includeMetadata: false,
          textLimit: undefined,
        },
      );
    });

    it('should extract detailed info with metadata enabled', async () => {
      const query = { includeMetadata: 'true' };
      const expectedResponse = {
        success: true,
        message: 'PDF information extracted successfully',
        data: {
          filename: 'test.pdf',
          size: 1024,
          numpages: 1,
          numrender: 1,
          info: null,
          metadata: null,
          text: 'Sample text content',
          version: '1.4',
          generatedMetadata: {
            description: 'This document contains sample text content',
            keywords: ['sample', 'text', 'content'],
          },
        },
      };

      mockPdfService.extractDetailedInfo.mockResolvedValue(expectedResponse);

      const result = await controller.extractPdfInfo(mockPdfFile, query);

      expect(result).toEqual(expectedResponse);
      expect(mockPdfService.extractDetailedInfo).toHaveBeenCalledWith(
        mockPdfFile,
        {
          includeMetadata: true,
          textLimit: undefined,
        },
      );
    });

    it('should extract detailed info with custom text limit', async () => {
      const query = { includeMetadata: 'true', textLimit: '2000' };
      const expectedResponse = {
        success: true,
        message: 'PDF information extracted successfully',
        data: {
          filename: 'test.pdf',
          size: 1024,
          numpages: 1,
          numrender: 1,
          info: null,
          metadata: null,
          text: 'Sample text content',
          version: '1.4',
          generatedMetadata: {
            description: 'This document contains sample text content',
            keywords: ['sample', 'text', 'content'],
          },
        },
      };

      mockPdfService.extractDetailedInfo.mockResolvedValue(expectedResponse);

      const result = await controller.extractPdfInfo(mockPdfFile, query);

      expect(result).toEqual(expectedResponse);
      expect(mockPdfService.extractDetailedInfo).toHaveBeenCalledWith(
        mockPdfFile,
        {
          includeMetadata: true,
          textLimit: 2000,
        },
      );
    });

    it('should handle false includeMetadata string', async () => {
      const query = { includeMetadata: 'false' };

      mockPdfService.extractDetailedInfo.mockResolvedValue({});

      await controller.extractPdfInfo(mockPdfFile, query);

      expect(mockPdfService.extractDetailedInfo).toHaveBeenCalledWith(
        mockPdfFile,
        {
          includeMetadata: false,
          textLimit: undefined,
        },
      );
    });
  });

  describe('extractPdfPages', () => {
    it('should extract pages info without metadata', async () => {
      const query = {};
      const expectedResponse = {
        success: true,
        message: 'PDF pages information extracted successfully',
        data: {
          filename: 'test.pdf',
          size: 1024,
          totalPages: 2,
          pages: [
            {
              page: 1,
              text: 'Page 1 content',
              metadata: {
                pageInfo: null,
                pageMetadata: null,
                numrender: 1,
                version: '1.4',
                totalPages: 2,
                pageNumber: 1,
                characterCount: 14,
                wordCount: 3,
                generatedMetadata: null,
              },
              nextPage: 2,
            },
            {
              page: 2,
              text: 'Page 2 content',
              metadata: {
                pageInfo: null,
                pageMetadata: null,
                numrender: 1,
                version: '1.4',
                totalPages: 2,
                pageNumber: 2,
                characterCount: 14,
                wordCount: 3,
                generatedMetadata: null,
              },
              nextPage: null,
            },
          ],
        },
      };

      mockPdfService.extractPagesInfo.mockResolvedValue(expectedResponse);

      const result = await controller.extractPdfPages(mockPdfFile, query);

      expect(result).toEqual(expectedResponse);
      expect(mockPdfService.extractPagesInfo).toHaveBeenCalledWith(
        mockPdfFile,
        {
          includeMetadata: false,
          textLimit: undefined,
        },
      );
    });

    it('should extract pages info with metadata enabled', async () => {
      const query = { includeMetadata: 'true' };
      const expectedResponse = {
        success: true,
        message: 'PDF pages information extracted successfully',
        data: {
          filename: 'test.pdf',
          size: 1024,
          totalPages: 1,
          pages: [
            {
              page: 1,
              text: 'Page 1 content',
              metadata: {
                pageInfo: null,
                pageMetadata: null,
                numrender: 1,
                version: '1.4',
                totalPages: 1,
                pageNumber: 1,
                characterCount: 14,
                wordCount: 3,
                generatedMetadata: {
                  description: 'This page contains content',
                  keywords: ['page', 'content'],
                },
              },
              nextPage: null,
            },
          ],
        },
      };

      mockPdfService.extractPagesInfo.mockResolvedValue(expectedResponse);

      const result = await controller.extractPdfPages(mockPdfFile, query);

      expect(result).toEqual(expectedResponse);
      expect(mockPdfService.extractPagesInfo).toHaveBeenCalledWith(
        mockPdfFile,
        {
          includeMetadata: true,
          textLimit: undefined,
        },
      );
    });

    it('should extract pages info with custom text limit', async () => {
      const query = { includeMetadata: 'true', textLimit: '1500' };

      mockPdfService.extractPagesInfo.mockResolvedValue({});

      await controller.extractPdfPages(mockPdfFile, query);

      expect(mockPdfService.extractPagesInfo).toHaveBeenCalledWith(
        mockPdfFile,
        {
          includeMetadata: true,
          textLimit: 1500,
        },
      );
    });
  });
});
