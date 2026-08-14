export type SystemRole = "Admin" | "Normal";
export type DocumentRole = "Owner" | "Editor" | "Viewer";
export type DocumentOperation = "READ" | "EDIT" | "DELETE";

export interface User {
  id: string;
  role: SystemRole;
}

export interface Document {
  id: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  acl: Map<string, DocumentRole>;
}

export interface DocumentService {
  read(id: string): Promise<string>;
  update(id: string, content: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface DocumentManager {
  addDocument(document: Document): Promise<void>;
  getDocAcl(id: string): Document["acl"];
}

// System role:
// Admin → global override
// Document-level access:
// Owner  → read/update/delete
// Editor → read/update
// Viewer → read

export interface AuthorizationPolicy {
  canRead(user: User, documentId: string): boolean;
  canUpdate(user: User, documentId: string): boolean;
  canDelete(user: User, documentId: string): boolean;
}

export type Policy = Record<DocumentOperation, DocumentRole[]>;

export const AccessPolicy: Readonly<Policy> = {
  READ: ["Owner", "Editor", "Viewer"],
  EDIT: ["Owner", "Editor"],
  DELETE: ["Owner"],
};

export class RealDocumentService implements DocumentService, DocumentManager {
  private readonly docMap = new Map<string, Document>();

  read(id: string): Promise<string> {
    const doc = this.docMap.get(id);
    if (doc === undefined) throw new Error(`doc with ${id} not available`);
    return Promise.resolve(doc.content);
  }

  addDocument(document: Document): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.docMap.set(document.id, document);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  update(id: string, content: string): Promise<void> {
    const doc = this.docMap.get(id);
    if (doc === undefined) throw new Error(`doc with ${id} not available`);
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        this.docMap.set(id, {
          ...doc,
          content,
          updatedAt: new Date().toISOString(),
        });
        resolve();
      }, 1000);
    });
  }

  delete(id: string): Promise<void> {
    this.docMap.delete(id);
    return Promise.resolve();
  }

  getDocAcl(documentId: string): Document["acl"] {
    const doc = this.docMap.get(documentId);
    if (doc === undefined)
      throw new Error(`doc with ${documentId} not available`);
    return doc.acl;
  }
}

export class ProtectedDocumentService implements DocumentService {
  constructor(
    private readonly docService: DocumentService,
    private readonly docAuthPolicy: AuthorizationPolicy,
    private readonly user: User,
  ) {}

  read(documentId: string): Promise<string> {
    if (this.docAuthPolicy.canRead(this.user, documentId)) {
      return this.docService.read(documentId);
    }
    throw new Error("User do not have access to read this document");
  }

  update(documentId: string, content: string): Promise<void> {
    if (this.docAuthPolicy.canUpdate(this.user, documentId)) {
      return this.docService.update(documentId, content);
    }
    throw new Error("User do not have access to update this document");
  }

  delete(documentId: string): Promise<void> {
    if (this.docAuthPolicy.canDelete(this.user, documentId)) {
      return this.docService.delete(documentId);
    }
    throw new Error("User do not have access to delete this document");
  }
}

export class DocumentAuthorizationPolicy implements AuthorizationPolicy {
  constructor(
    private realDocumentService: DocumentManager,
    private policy: Record<DocumentOperation, DocumentRole[]>,
  ) {}

  private can(
    user: User,
    documentId: string,
    operation: DocumentOperation,
  ): boolean {
    if (user.role === "Admin") return true;
    const acl = this.realDocumentService.getDocAcl(documentId);
    const userDocRole = acl.get(user.id);
    if (userDocRole === undefined) return false;
    return this.policy[operation].includes(userDocRole);
  }

  canRead(user: User, documentId: string): boolean {
    return this.can(user, documentId, "READ");
  }

  canUpdate(user: User, documentId: string): boolean {
    return this.can(user, documentId, "EDIT");
  }

  canDelete(user: User, documentId: string): boolean {
    return this.can(user, documentId, "DELETE");
  }
}
