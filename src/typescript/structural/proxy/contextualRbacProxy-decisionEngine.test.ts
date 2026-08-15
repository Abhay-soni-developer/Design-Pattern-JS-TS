import {
  DocumentRole,
  User,
  ProtectedDocumentService,
  RealDocumentService,
  AuthorizationRuleEngine,
  AdminOverrideRule,
  EditorPermissionRule,
  LockedDocumentEditRule,
  OwnerPermissionRule,
  ViewerPermissionRule,
  Document,
} from "./contextualRbacProxy-decisionEngine.js";

const documentService = new RealDocumentService();

const authorizationEngine = new AuthorizationRuleEngine([
  new AdminOverrideRule(),
  new OwnerPermissionRule(),
  new EditorPermissionRule(),
  new ViewerPermissionRule(),
  new LockedDocumentEditRule(),
]);

const admin: User = {
  id: "admin-1",
  role: "Admin",
};

const protectedDocumentService = new ProtectedDocumentService(
  admin,
  documentService,
  authorizationEngine,
);

async function runAuthorizationTest(
  name: string,
  operation: () => Promise<unknown>,
  shouldAllow: boolean,
): Promise<void> {
  try {
    const result = await operation();

    if (!shouldAllow) {
      console.log(`❌ ${name} — expected denial but operation succeeded`);
      return;
    }

    console.log(`✅ ${name}`);

    if (result !== undefined) {
      console.log("   Result:", result);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (shouldAllow) {
      console.log(`❌ ${name} — unexpected failure: ${message}`);
      return;
    }

    console.log(`✅ ${name} — correctly denied: ${message}`);
  }
}

const unlockedDocument: Document = {
  id: "doc-unlocked",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: "Unlocked document content",
  locked: false,
  acl: new Map<string, DocumentRole>([
    ["owner-1", "Owner"],
    ["editor-1", "Editor"],
    ["viewer-1", "Viewer"],
  ]),
};

const lockedDocument: Document = {
  id: "doc-locked",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: "Locked document content",
  locked: true,
  acl: new Map<string, DocumentRole>([
    ["owner-1", "Owner"],
    ["editor-1", "Editor"],
    ["viewer-1", "Viewer"],
  ]),
};

await documentService.addDocument(unlockedDocument);
await documentService.addDocument(lockedDocument);

const owner: User = {
  id: "owner-1",
  role: "Normal",
};

const editor: User = {
  id: "editor-1",
  role: "Normal",
};

const viewer: User = {
  id: "viewer-1",
  role: "Normal",
};

const outsider: User = {
  id: "outsider-1",
  role: "Normal",
};

const adminDocumentService = new ProtectedDocumentService(
  admin,
  documentService,
  authorizationEngine,
);

const ownerDocumentService = new ProtectedDocumentService(
  owner,
  documentService,
  authorizationEngine,
);

const editorDocumentService = new ProtectedDocumentService(
  editor,
  documentService,
  authorizationEngine,
);

const viewerDocumentService = new ProtectedDocumentService(
  viewer,
  documentService,
  authorizationEngine,
);

const outsiderDocumentService = new ProtectedDocumentService(
  outsider,
  documentService,
  authorizationEngine,
);

console.log("\n--- DECISION RULE ENGINE TESTS ---");

await runAuthorizationTest(
  "Admin can read locked document",
  () => adminDocumentService.read("doc-locked"),
  true,
);

await runAuthorizationTest(
  "Owner can delete unlocked document",
  () => ownerDocumentService.delete("doc-unlocked"),
  true,
);

// Add it back because the previous test deleted it.
await documentService.addDocument(unlockedDocument);

await runAuthorizationTest(
  "Editor can edit unlocked document",
  () => editorDocumentService.update("doc-unlocked", "Updated by editor"),
  true,
);

await runAuthorizationTest(
  "Editor cannot edit locked document",
  () => editorDocumentService.update("doc-locked", "Illegal locked edit"),
  false,
);

await runAuthorizationTest(
  "Editor cannot delete document",
  () => editorDocumentService.delete("doc-locked"),
  false,
);

await runAuthorizationTest(
  "Viewer can read document",
  () => viewerDocumentService.read("doc-locked"),
  true,
);

await runAuthorizationTest(
  "Viewer cannot edit document",
  () => viewerDocumentService.update("doc-locked", "Illegal viewer edit"),
  false,
);

await runAuthorizationTest(
  "Outsider is denied when every rule abstains",
  () => outsiderDocumentService.read("doc-locked"),
  false,
);
