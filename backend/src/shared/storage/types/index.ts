export interface StorageFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadOptions {
  folder?: string;
  allowedMimeTypes?: string[];
  maxSizeBytes?: number;
  tags?: string[];
}

export interface StorageFileMetadata {
  publicId: string;
  url: string;
  secureUrl: string;
  provider: string;
  fileSize: number;
  mimeType: string;
  originalFilename: string;
  storedFilename: string;
  uploadedAt: Date;
}

export interface DownloadOptions {
  resourceType?: 'raw' | 'image' | 'video' | 'auto';
}
