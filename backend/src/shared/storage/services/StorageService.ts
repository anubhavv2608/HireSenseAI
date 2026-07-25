import { BadRequestError } from '../../errors/ApiError';
import { STORAGE_MESSAGES } from '../constants';
import { IStorageProvider } from '../interfaces/IStorageProvider';
import { CloudinaryStorageProvider } from '../providers/CloudinaryStorageProvider';
import { DownloadOptions, StorageFile, StorageFileMetadata, UploadOptions } from '../types';
import { validateFile } from '../utils/fileValidation';

export class StorageService {
  private provider: IStorageProvider;

  constructor(provider?: IStorageProvider) {
    this.provider = provider || new CloudinaryStorageProvider();
  }

  setProvider(provider: IStorageProvider): void {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.providerName;
  }

  async uploadFile(file: StorageFile, options?: UploadOptions): Promise<StorageFileMetadata> {
    validateFile(file, options);
    return this.provider.upload(file, options);
  }

  async downloadFile(publicId: string, options?: DownloadOptions): Promise<Buffer> {
    if (!publicId || publicId.trim() === '') {
      throw new BadRequestError(STORAGE_MESSAGES.INVALID_PUBLIC_ID);
    }
    return this.provider.download(publicId, options);
  }

  async deleteFile(publicId: string): Promise<boolean> {
    return this.provider.delete(publicId);
  }
}
