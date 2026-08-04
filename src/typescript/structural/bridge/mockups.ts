import {
  DeleteInput,
  DeleteResult,
  DownloadInput,
  DownloadResult,
  UploadInput,
  UploadResult,
} from "./file-operation.js";

export const mockUploadInput: UploadInput = {
  key: "documents/report.pdf",
  data: new Uint8Array([1, 2, 3, 4]),
  contentType: "application/pdf",
  metadata: {
    owner: "Abhay",
    source: "test",
  },
  overwrite: false,
};

export const mockUploadResult: UploadResult = {
  key: "documents/report.pdf",
  sizeInBytes: 4,
  version: "v1",
  url: "https://storage.example.com/documents/report.pdf",
  uploadedAt: new Date(),
};

export const mockDownloadInput: DownloadInput = {
  key: "documents/report.pdf",
  version: "v1",
  range: {
    start: 0,
    end: 1023,
  },
};

export const mockDownloadResult: DownloadResult = {
  key: "documents/report.pdf",
  data: new Uint8Array([1, 2, 3, 4]),
  contentType: "application/pdf",
  sizeInBytes: 4,
  metadata: {
    owner: "Abhay",
    source: "test",
  },
  version: "v1",
  lastModifiedAt: new Date(),
};

export const mockDeleteInput: DeleteInput = {
  key: "documents/report.pdf",
  version: "v1",
  permanent: false,
};

export const mockDeleteResult: DeleteResult = {
  key: "documents/report.pdf",
  deleted: true,
  version: "v1",
  deletedAt: new Date(),
};
