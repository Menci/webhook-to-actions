export async function checkSignature(request: Request, body: string, secret: string) {
  const signatureHeader = request.headers.get("X-Hub-Signature-256");
  if (!signatureHeader) return false;

  const expectedSignatureHeader = "sha256=" + (await getSignature(secret, body));
  return signatureHeader.toLowerCase() === expectedSignatureHeader.toLowerCase();
}

export async function getSignature(secret: string, payload: string) {
  const algorithm = { name: "HMAC", hash: "SHA-256" };
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), algorithm, false, [
    "sign",
    "verify"
  ]);
  const signature = await crypto.subtle.sign(algorithm.name, key, new TextEncoder().encode(payload));
  return [...new Uint8Array(signature)].map(x => x.toString(16).padStart(2, "0")).join("");
}
