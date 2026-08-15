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

export interface IDocumentService {
  read(documentId: string): Promise<string>;
  update(documentId: string, content: string): Promise<void>;
  delete(documentId: string): Promise<void>;
}

export interface IDocumentManager {
  addDocument(document: Document): Promise<void>;
  getDocAcl(documentId: string): Document["acl"];
  getDocument(documentId: string): Document;
}

// ALLOW + ABSTAIN
// DENY + ABSTAIN
// ALLOW + DENY
// ABSTAIN + ABSTAIN
// ALLOW + ALLOW
// DENY + DENY
export interface AuthorizationRule {
  evaluate(context: AuthorizationContext): Decision;
  // and(rule: AuthorizationRule): AuthorizationRule;
  // or(rule: AuthorizationRule): AuthorizationRule;
  // not(): AuthorizationRule;
}

export class AdminOverrideRule implements AuthorizationRule {
  evaluate(context: AuthorizationContext): Decision {
    return context.user.role === "Admin" ? "ALLOW" : "ABSTAIN";
  }
}

export class OwnerPermissionRule implements AuthorizationRule {
  evaluate(context: AuthorizationContext): Decision {
    const { document, user, operation } = context;
    const userRole = document.acl.get(user.id);

    if (
      userRole === "Owner" &&
      ["READ", "EDIT", "DELETE"].includes(operation)
    ) {
      return "ALLOW";
    }

    return "ABSTAIN";
  }
}

export class EditorPermissionRule implements AuthorizationRule {
  evaluate(context: AuthorizationContext): Decision {
    const { document, user, operation } = context;
    const userRole = document.acl.get(user.id);

    if (userRole === "Editor" && ["READ", "EDIT"].includes(operation)) {
      return "ALLOW";
    } else if (userRole === "Editor" && ["DELETE"].includes(operation)) {
      return "DENY";
    }
    return "ABSTAIN";
  }
}

export class ViewerPermissionRule implements AuthorizationRule {
  evaluate(context: AuthorizationContext): Decision {
    const { document, user, operation } = context;
    const userRole = document.acl.get(user.id);

    if (userRole === "Viewer" && ["READ"].includes(operation)) {
      return "ALLOW";
    } else if (
      userRole === "Viewer" &&
      ["EDIT", "DELETE"].includes(operation)
    ) {
      return "DENY";
    }
    return "ABSTAIN";
  }
}

export class LockedDocumentEditRule implements AuthorizationRule {
  evaluate(context: AuthorizationContext): Decision {
    const { document, user, operation } = context;
    const userRole = document.acl.get(user.id);

    if (operation === "EDIT" && document.locked) {
      if (userRole === "Editor") {
        return "DENY";
      }
    }

    return "ABSTAIN";
  }
}

export class AuthorizationRuleEngine implements AuthorizationRule {
  private readonly decisionTable: Record<string, Decision> = {
    "ALLOW + ABSTAIN": "ALLOW",
    "DENY + ABSTAIN": "DENY",
    "ALLOW + DENY": "DENY",
    "ABSTAIN + ABSTAIN": "ABSTAIN",
    "ALLOW + ALLOW": "ALLOW",
    "DENY + DENY": "DENY",
    "ABSTAIN + ALLOW": "ALLOW",
    "ABSTAIN + DENY": "DENY",
    "DENY + ALLOW": "DENY",
  };
  constructor(private readonly authorizationRules: AuthorizationRule[]) {}

  evaluate(context: AuthorizationContext): Decision {
    let lastResult: Decision | undefined = "ABSTAIN";
    for (let rule of this.authorizationRules) {
      const res = rule.evaluate(context);
      const key = `${lastResult} + ${res}`;
      let decision = this.decisionTable[key];
      if (decision === undefined)
        throw new Error("Unknown Decision Operation Detected");
      if (decision === "DENY") return decision;
      lastResult = decision as Decision;
    }

    return lastResult;
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

  getDocument(documentId: string): Document {
    const document = this.docMap.get(documentId);
    if (document === undefined) {
      throw new Error(`document with this ${documentId} is not available`);
    }
    return document;
  }
}

export class ProtectedDocumentService implements IDocumentService {
  constructor(
    private readonly user: User,
    private readonly documentService: IDocumentService & IDocumentManager,
    private readonly authorizationEvaluator: AuthorizationRule,
  ) {}

  read(documentId: string): Promise<string> {
    const document = this.documentService.getDocument(documentId);
    const authContext: AuthorizationContext = {
      document,
      user: this.user,
      operation: "READ",
    };

    if (this.authorizationEvaluator.evaluate(authContext) === "ALLOW") {
      return this.documentService.read(documentId);
    }

    throw Error("Access Denied");
  }

  update(documentId: string, content: string): Promise<void> {
    const document = this.documentService.getDocument(documentId);
    const authContext: AuthorizationContext = {
      document,
      user: this.user,
      operation: "EDIT",
    };
    if (this.authorizationEvaluator.evaluate(authContext) === "ALLOW") {
      return this.documentService.update(documentId, content);
    }

    throw new Error("Access Denied");
  }

  delete(documentId: string): Promise<void> {
    const document = this.documentService.getDocument(documentId);
    const authContext: AuthorizationContext = {
      document,
      user: this.user,
      operation: "DELETE",
    };
    if (this.authorizationEvaluator.evaluate(authContext) === "ALLOW") {
      return this.documentService.delete(documentId);
    }
    throw new Error("Access Denied");
  }
}


