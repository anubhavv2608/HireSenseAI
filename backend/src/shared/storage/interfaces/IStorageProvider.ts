import { DownloadOptions, StorageFile, StorageFileMetadata, UploadOptions } from '../types';

export interface IStorageProvider {
  readonly providerName: string;
  upload(file: StorageFile, options?: UploadOptions): Promise<StorageFileMetadata>;
  download(publicId: string, options?: DownloadOptions): Promise<Buffer>;
  delete(publicId: string): Promise<boolean>;
}
