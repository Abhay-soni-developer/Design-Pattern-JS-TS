export type SystemRole = "Admin" | "Normal";
export type DocumentRole = "Owner" | "Editor" | "Viewer";
export type DocumentOperation = "READ" | "EDIT" | "DELETE";
export type Decision = "ALLOW" | "DENY" | "ABSTAIN";

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
  // * Editor can edit only when the document is not locked.
  // * Owner can edit even when locked.
  // * Admin can edit even when locked.
  locked: boolean;
}

export interface AuthorizationContext {
  document: Document;
  user: User;
  operation: DocumentOperation;
}

export interface IAuthorizationSpecification {
  evaluate(context: AuthorizationContext): boolean;
  and(rule: IAuthorizationSpecification): IAuthorizationSpecification;
  or(rule: IAuthorizationSpecification): IAuthorizationSpecification;
  not(): IAuthorizationSpecification;
}

export interface IDocumentService {
  read(id: string): Promise<string>;
  update(id: string, content: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IAuthorizationPolicy {
  canRead(user: User, documentId: string): Promise<boolean>;
  canUpdate(user: User, documentId: string): Promise<boolean>;
  canDelete(user: User, documentId: string): Promise<boolean>;
}

export interface IDocumentManager {
  getDocument(documentId: string): Promise<Document>;
  addDocument(document: Document): Promise<void>;
  getDocAcl(id: string): Document["acl"];
}

export abstract class AuthorizationSpecification implements IAuthorizationSpecification {
  abstract evaluate(context: AuthorizationContext): boolean;

  and(rule: IAuthorizationSpecification): IAuthorizationSpecification {
    return new AndAuthorizationSpecification(this, rule);
  }

  or(rule: IAuthorizationSpecification): IAuthorizationSpecification {
    return new OrAuthorizationSpecification(this, rule);
  }

  not(): IAuthorizationSpecification {
    return new NotAuthorizationSpecification(this);
  }
}

export class RealDocumentService implements IDocumentService, IDocumentManager {
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

  getDocument(documentId: string): Promise<Document> {
    const document = this.docMap.get(documentId);
    if (document === undefined)
      throw new Error(`doc with ${documentId} not available`);
    return Promise.resolve(document);
  }
}

export class IsViewer extends AuthorizationSpecification {
  evaluate(context: AuthorizationContext): boolean {
    const { document, user } = context;
    if (document.acl.get(user.id) === "Viewer") {
      return true;
    }
    return false;
  }
}

export class IsAdmin extends AuthorizationSpecification {
  evaluate(context: AuthorizationContext): boolean {
    const { document, user } = context;
    if (user.role === "Admin") {
      return true;
    }
    return false;
  }
}

export class IsOwner extends AuthorizationSpecification {
  evaluate(context: AuthorizationContext): boolean {
    const { document, user } = context;
    if (document.acl.get(user.id) === "Owner") {
      return true;
    }
    return false;
  }
}

export class IsEditor extends AuthorizationSpecification {
  evaluate(context: AuthorizationContext): boolean {
    const { document, user } = context;
    if (document.acl.get(user.id) === "Editor") {
      return true;
    }
    return false;
  }
}

export class IsDocumentUnlocked extends AuthorizationSpecification {
  evaluate(context: AuthorizationContext): boolean {
    const { document, user } = context;
    if (document.locked) {
      return false;
    }
    return true;
  }
}

export class AndAuthorizationSpecification extends AuthorizationSpecification {
  constructor(
    private leftAuthRule: IAuthorizationSpecification,
    private rightAuthRule: IAuthorizationSpecification,
  ) {
    super();
  }

  override evaluate(context: AuthorizationContext): boolean {
    const leftEvalResult: boolean = this.leftAuthRule.evaluate(context);
    const rightEvalResult: boolean = this.rightAuthRule.evaluate(context);

    if (leftEvalResult && rightEvalResult) {
      return true;
    }
    return false;
  }
}

export class OrAuthorizationSpecification extends AuthorizationSpecification {
  constructor(
    private leftAuthRule: IAuthorizationSpecification,
    private rightAuthRule: IAuthorizationSpecification,
  ) {
    super();
  }

  override evaluate(context: AuthorizationContext): boolean {
    const leftEvalResult: boolean = this.leftAuthRule.evaluate(context);
    const rightEvalResult: boolean = this.rightAuthRule.evaluate(context);

    if (leftEvalResult || rightEvalResult) {
      return true;
    }

    return false;
  }
}

export class NotAuthorizationSpecification extends AuthorizationSpecification {
  constructor(private authRule: IAuthorizationSpecification) {
    super();
  }

  override evaluate(context: AuthorizationContext): boolean {
    return !this.authRule.evaluate(context);
  }
}

export class ProtectedDocumentProxy implements IDocumentService {
  constructor(
    private readonly docService: IDocumentService,
    private readonly docAuthPolicy: IAuthorizationPolicy,
    private readonly user: User,
  ) {}

  async read(documentId: string): Promise<string> {
    if (await this.docAuthPolicy.canRead(this.user, documentId)) {
      return this.docService.read(documentId);
    }
    throw new Error("User do not have access to read this document");
  }

  async update(documentId: string, content: string): Promise<void> {
    if (await this.docAuthPolicy.canUpdate(this.user, documentId)) {
      return this.docService.update(documentId, content);
    }
    throw new Error("User do not have access to update this document");
  }

  async delete(documentId: string): Promise<void> {
    if (await this.docAuthPolicy.canDelete(this.user, documentId)) {
      return this.docService.delete(documentId);
    }
    throw new Error("User do not have access to delete this document");
  }
}

export class DocumentAuthorizationPolicy implements IAuthorizationPolicy {
  private readonly rules: Record<
    DocumentOperation,
    IAuthorizationSpecification
  >;
  constructor(
    private readonly documentService: IDocumentManager,
    private readonly readRule: IAuthorizationSpecification,
    private readonly updateRule: IAuthorizationSpecification,
    private readonly deleteRule: IAuthorizationSpecification,
  ) {
    this.rules = {
      READ: readRule,
      EDIT: updateRule,
      DELETE: deleteRule,
    };
  }

  async can(
    user: User,
    documentId: string,
    rule: DocumentOperation,
  ): Promise<boolean> {
    const document = await this.documentService.getDocument(documentId);
    const authContext: AuthorizationContext = {
      document,
      user,
      operation: rule,
    };

    return this.rules[rule].evaluate(authContext);
  }

  async canRead(user: User, documentId: string): Promise<boolean> {
    return this.can(user, documentId, "READ");
  }

  async canUpdate(user: User, documentId: string): Promise<boolean> {
    return this.can(user, documentId, "EDIT");
  }

  async canDelete(user: User, documentId: string): Promise<boolean> {
    return this.can(user, documentId, "DELETE");
  }
}

export const readRule = new IsAdmin().or(
  new IsOwner().or(new IsEditor()).or(new IsViewer()),
);

export const editRule = new IsAdmin()
  .or(new IsOwner())
  .or(new IsEditor().and(new IsDocumentUnlocked()));

export const deleteRule = new IsAdmin().or(new IsOwner());
