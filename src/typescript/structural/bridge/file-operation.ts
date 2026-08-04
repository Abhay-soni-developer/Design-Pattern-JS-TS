import {
  mockDeleteResult,
  mockDownloadInput,
  mockDownloadResult,
  mockUploadResult,
} from "./mockups.js";

type StorageMetadata = Record<string, string>;

export interface UploadInput {
  key: string;
  data: Uint8Array;
  contentType?: string;
  metadata?: StorageMetadata;
  overwrite?: boolean;
}

export interface UploadResult {
  key: string;
  sizeInBytes: number;
  version?: string;
  url?: string;
  uploadedAt: Date;
}

export interface DownloadInput {
  key: string;
  version?: string;
  /**
   * Optional byte range for partial downloads.
   */
  range?: {
    start: number;
    end?: number;
  };
}

export interface DownloadResult {
  key: string;
  data: Uint8Array;
  contentType?: string;
  sizeInBytes: number;
  metadata: StorageMetadata;
  version?: string;
  lastModifiedAt?: Date;
}

export interface DeleteInput {
  key: string;
  version?: string;
  permanent?: boolean;
}

export interface DeleteResult {
  key: string;
  deleted: boolean;
  version?: string;
  deletedAt: Date;
}

export interface UploadStorage {
  upload(input: UploadInput): Promise<UploadResult>;
}

export interface DownloadStorage {
  download(input: DownloadInput): Promise<DownloadResult>;
}

export interface DeleteStorage {
  delete(input: DeleteInput): Promise<DeleteResult>;
}

class FileUpload {
  constructor(
    private readonly storage: UploadStorage,
    private readonly input: UploadInput,
  ) {}

  execute(): Promise<UploadResult> {
    return this.storage.upload(this.input);
  }
}

class FileDownload {
  constructor(
    private readonly storage: DownloadStorage,
    private readonly input: DownloadInput,
  ) {}

  execute(): Promise<DownloadResult> {
    return this.storage.download(this.input);
  }
}

class FileDeletion {
  constructor(
    private readonly storage: DeleteStorage,
    private readonly input: DeleteInput,
  ) {}

  execute(): Promise<DeleteResult> {
    return this.storage.delete(this.input);
  }
}

class AmazonS3 implements UploadStorage, DownloadStorage, DeleteStorage {
  private readonly name: string;
  constructor() {
    this.name = new.target.name;
  }

  upload(input: UploadInput): Promise<UploadResult> {
    console.log(`uploading ${input.key} using ${this.name}`);
    return Promise.resolve(mockUploadResult);
  }

  download(input: DownloadInput): Promise<DownloadResult> {
    console.log(`downloading ${input.key} using ${this.name}`);
    return Promise.resolve(mockDownloadResult);
  }

  delete(input: DeleteInput): Promise<DeleteResult> {
    console.log(`deleting ${input.key} using ${this.name}`);
    return Promise.resolve(mockDeleteResult);
  }
}

class GoogleCloudStorage implements UploadStorage, DeleteStorage {
  private readonly name: string;

  constructor() {
    this.name = new.target.name;
  }

  upload(input: UploadInput): Promise<UploadResult> {
    console.log(`uploading ${input.key} using ${this.name}`);
    return Promise.resolve(mockUploadResult);
  }

  delete(input: DeleteInput): Promise<DeleteResult> {
    console.log(`deleting ${input.key} using ${this.name}`);
    return Promise.resolve(mockDeleteResult);
  }
}

class AzureBlobStorage
  implements UploadStorage, DownloadStorage, DeleteStorage
{
  private readonly name: string;

  constructor() {
    this.name = new.target.name;
  }

  upload(input: UploadInput): Promise<UploadResult> {
    console.log(`uploading ${input.key} using ${this.name}`);
    return Promise.resolve(mockUploadResult);
  }

  download(input: DownloadInput): Promise<DownloadResult> {
    console.log(`downloading ${input.key} using ${this.name}`);
    return Promise.resolve(mockDownloadResult);
  }

  delete(input: DeleteInput): Promise<DeleteResult> {
    console.log(`deleting ${input.key} using ${this.name}`);
    return Promise.resolve(mockDeleteResult);
  }
}

const downloadF1 = new FileDownload(new AzureBlobStorage(), mockDownloadInput);
// const downloadF2 = new FileDownload(new GoogleCloudStorage(), mockDownloadInput);
// // compile error because google cloud does not support it

/*
FileUpload
    ↓ Bridge
UploadStorage
    ↓
AmazonS3StorageAdapter
    ↓ Adapter
AWS SDK
*/
