import {
  AccessPolicy,
  AuthorizationPolicy,
  Document,
  DocumentAuthorizationPolicy,
  DocumentRole,
  DocumentService,
  ProtectedDocumentService,
  RealDocumentService,
  User,
} from "./protectionProxyDoc.js";

const realDocumentService = new RealDocumentService();

const document: Document = {
  id: "doc-101",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: "Initial document content",
  acl: new Map<string, DocumentRole>([
    ["owner-1", "Owner"],
    ["editor-1", "Editor"],
    ["viewer-1", "Viewer"],
  ]),
};

realDocumentService.addDocument(document);

const authorizationPolicy: AuthorizationPolicy =
  new DocumentAuthorizationPolicy(realDocumentService, AccessPolicy);

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

const adminService: DocumentService = new ProtectedDocumentService(
  realDocumentService,
  authorizationPolicy,
  admin,
);

const ownerService: DocumentService = new ProtectedDocumentService(
  realDocumentService,
  authorizationPolicy,
  owner,
);

const editorService: DocumentService = new ProtectedDocumentService(
  realDocumentService,
  authorizationPolicy,
  editor,
);

const viewerService: DocumentService = new ProtectedDocumentService(
  realDocumentService,
  authorizationPolicy,
  viewer,
);

const outsiderService: DocumentService = new ProtectedDocumentService(
  realDocumentService,
  authorizationPolicy,
  outsider,
);

// test utilitiy
async function test(
  name: string,
  operation: () => Promise<unknown>,
): Promise<void> {
  try {
    const result = await operation();

    console.log(`✅ ${name}`);

    if (result !== undefined) {
      console.log("   Result:", result);
    }
  } catch (error) {
    console.log(`❌ ${name}:`, error instanceof Error ? error.message : error);
  }
}

console.log("\n--- VIEWER TESTS ---");

await test("Viewer can read", () => viewerService.read("doc-101"));

await test("Viewer cannot update", () =>
  viewerService.update("doc-101", "Viewer trying to modify document"));

await test("Viewer cannot delete", () => viewerService.delete("doc-101"));

console.log("\n--- EDITOR TESTS ---");

await test("Editor can read", () => editorService.read("doc-101"));

await test("Editor can update", () =>
  editorService.update("doc-101", "Updated by editor"));

await test("Editor cannot delete", () => editorService.delete("doc-101"));

console.log("\n--- OWNER TESTS ---");

await test("Owner can read", () => ownerService.read("doc-101"));

await test("Owner can update", () =>
  ownerService.update("doc-101", "Updated by owner"));

console.log("\n--- ADMIN TESTS ---");

await test("Admin can read without ACL entry", () =>
  adminService.read("doc-101"));

await test("Admin can update without ACL entry", () =>
  adminService.update("doc-101", "Updated by admin"));

console.log("\n--- OUTSIDER TESTS ---");

await test("Outsider cannot read", () => outsiderService.read("doc-101"));

await test("Outsider cannot update", () =>
  outsiderService.update("doc-101", "Illegal update"));

await test("Outsider cannot delete", () => outsiderService.delete("doc-101"));

console.log("\n--- DELETE TESTS ---");

await test("Owner can delete", () => ownerService.delete("doc-101"));

await test("Reading deleted document fails", () =>
  ownerService.read("doc-101"));
