import {
  DocumentRole,
  IAuthorizationPolicy,
  ProtectedDocumentProxy,
  RealDocumentService,
  User,
  DocumentAuthorizationPolicy,
  deleteRule,
  editRule,
  readRule,
  Document,
} from "./contextualRbacProxy-specificationPattern.js";

async function runTest(
  name: string,
  operation: () => Promise<unknown>,
  shouldPass: boolean,
): Promise<void> {
  try {
    const result = await operation();

    if (!shouldPass) {
      console.log(`❌ ${name} — expected failure but passed`);
      return;
    }

    console.log(`✅ ${name}`);

    if (result !== undefined) {
      console.log("   Result:", result);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (shouldPass) {
      console.log(`❌ ${name} — unexpected failure: ${message}`);
      return;
    }

    console.log(`✅ ${name} — correctly denied: ${message}`);
  }
}

const realDocumentService = new RealDocumentService();

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

await realDocumentService.addDocument(unlockedDocument);
await realDocumentService.addDocument(lockedDocument);

const authorizationPolicy: IAuthorizationPolicy =
  new DocumentAuthorizationPolicy(
    realDocumentService,
    readRule,
    editRule,
    deleteRule,
  );

const admin: User = {
  id: "admin-1",
  role: "Admin",
};

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

const adminProxy = new ProtectedDocumentProxy(
  realDocumentService,
  authorizationPolicy,
  admin,
);

const ownerProxy = new ProtectedDocumentProxy(
  realDocumentService,
  authorizationPolicy,
  owner,
);

const editorProxy = new ProtectedDocumentProxy(
  realDocumentService,
  authorizationPolicy,
  editor,
);

const viewerProxy = new ProtectedDocumentProxy(
  realDocumentService,
  authorizationPolicy,
  viewer,
);

const outsiderProxy = new ProtectedDocumentProxy(
  realDocumentService,
  authorizationPolicy,
  outsider,
);

console.log("\n--- UNLOCKED DOCUMENT TESTS ---");

await runTest(
  "Viewer can read unlocked document",
  () => viewerProxy.read("doc-unlocked"),
  true,
);

await runTest(
  "Viewer cannot edit unlocked document",
  () => viewerProxy.update("doc-unlocked", "viewer update"),
  false,
);

await runTest(
  "Viewer cannot delete unlocked document",
  () => viewerProxy.delete("doc-unlocked"),
  false,
);

await runTest(
  "Editor can read unlocked document",
  () => editorProxy.read("doc-unlocked"),
  true,
);

await runTest(
  "Editor can edit unlocked document",
  () => editorProxy.update("doc-unlocked", "updated by editor"),
  true,
);

await runTest(
  "Editor cannot delete unlocked document",
  () => editorProxy.delete("doc-unlocked"),
  false,
);

await runTest(
  "Owner can read unlocked document",
  () => ownerProxy.read("doc-unlocked"),
  true,
);

await runTest(
  "Owner can edit unlocked document",
  () => ownerProxy.update("doc-unlocked", "updated by owner"),
  true,
);

await runTest(
  "Admin can read unlocked document without ACL entry",
  () => adminProxy.read("doc-unlocked"),
  true,
);

await runTest(
  "Admin can edit unlocked document without ACL entry",
  () => adminProxy.update("doc-unlocked", "updated by admin"),
  true,
);

await runTest(
  "Outsider cannot read unlocked document",
  () => outsiderProxy.read("doc-unlocked"),
  false,
);

await runTest(
  "Outsider cannot edit unlocked document",
  () => outsiderProxy.update("doc-unlocked", "outsider update"),
  false,
);

await runTest(
  "Outsider cannot delete unlocked document",
  () => outsiderProxy.delete("doc-unlocked"),
  false,
);

console.log("\n--- LOCKED DOCUMENT TESTS ---");

await runTest(
  "Viewer can read locked document",
  () => viewerProxy.read("doc-locked"),
  true,
);

await runTest(
  "Viewer cannot edit locked document",
  () => viewerProxy.update("doc-locked", "viewer update"),
  false,
);

await runTest(
  "Editor can read locked document",
  () => editorProxy.read("doc-locked"),
  true,
);

await runTest(
  "Editor cannot edit locked document",
  () => editorProxy.update("doc-locked", "editor update"),
  false,
);

await runTest(
  "Owner can read locked document",
  () => ownerProxy.read("doc-locked"),
  true,
);

await runTest(
  "Owner can edit locked document",
  () => ownerProxy.update("doc-locked", "owner update"),
  true,
);

await runTest(
  "Admin can read locked document without ACL entry",
  () => adminProxy.read("doc-locked"),
  true,
);

await runTest(
  "Admin can edit locked document without ACL entry",
  () => adminProxy.update("doc-locked", "admin update"),
  true,
);

await runTest(
  "Outsider cannot read locked document",
  () => outsiderProxy.read("doc-locked"),
  false,
);

console.log("\n--- DELETE TESTS ---");

await runTest(
  "Viewer cannot delete locked document",
  () => viewerProxy.delete("doc-locked"),
  false,
);

await runTest(
  "Editor cannot delete locked document",
  () => editorProxy.delete("doc-locked"),
  false,
);

await runTest(
  "Owner can delete locked document",
  () => ownerProxy.delete("doc-locked"),
  true,
);

await runTest(
  "Reading deleted locked document fails",
  () => ownerProxy.read("doc-locked"),
  false,
);

await runTest(
  "Admin can delete unlocked document",
  () => adminProxy.delete("doc-unlocked"),
  true,
);

await runTest(
  "Reading deleted unlocked document fails",
  () => adminProxy.read("doc-unlocked"),
  false,
);
