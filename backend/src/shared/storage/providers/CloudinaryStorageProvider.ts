import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config';
import { BadRequestError, InternalServerError, NotFoundError } from '../../errors/ApiError';
import { IStorageProvider } from '../interfaces/IStorageProvider';
import { DownloadOptions, StorageFile, StorageFileMetadata, UploadOptions } from '../types';

export class CloudinaryStorageProvider implements IStorageProvider {
  readonly providerName = 'Cloudinary';

  constructor() {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });
  }

  async upload(file: StorageFile, options?: UploadOptions): Promise<StorageFileMetadata> {
    return new Promise((resolve, reject) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueFilename = `${uuidv4()}${ext}`;
      const folderName = options?.folder || 'hiresense_uploads';

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          public_id: path.parse(uniqueFilename).name,
          resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto',
          tags: options?.tags,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(
              new InternalServerError(
                `Cloudinary upload failed: ${error?.message || 'Unknown upload error'}`
              )
            );
          }

          const metadata: StorageFileMetadata = {
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
            provider: this.providerName,
            fileSize: result.bytes || file.size,
            mimeType: file.mimetype,
            originalFilename: file.originalname,
            storedFilename: uniqueFilename,
            uploadedAt: new Date(result.created_at || Date.now()),
          };

          resolve(metadata);
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  async download(publicId: string, options?: DownloadOptions): Promise<Buffer> {
    if (!publicId || publicId.trim() === '') {
      throw new BadRequestError('Invalid Cloudinary public ID for download');
    }

    const resourceType = options?.resourceType || 'image';
    const url = cloudinary.url(publicId, { resource_type: resourceType, secure: true });

    let response: Response;
    try {
      response = await fetch(url);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerError(`Cloudinary download failed: ${message}`);
    }

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError('File not found in Cloudinary storage');
      }
      throw new InternalServerError(`Cloudinary download failed with status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async delete(publicId: string): Promise<boolean> {
    if (!publicId || publicId.trim() === '') {
      throw new BadRequestError('Invalid Cloudinary public ID for deletion');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerError(`Cloudinary delete failed: ${message}`);
    }
  }
}
