import { checkSignature, getSignature } from "./signature";
import { handleWebhook } from "./webhook";

self.addEventListener("fetch", async (event: FetchEvent) => {
  event.respondWith(
    (async () => {
      const headers = {
        "Content-Type": "application/json"
      };

      let result: Record<string, unknown>;
      try {
        result = await handleRequest(event);
      } catch (e) {
        result = {
          error: e.message,
          stack: e.stack.split("\n")
        };
      }

      return new Response(JSON.stringify(result || {}, null, 2), {
        status: "error" in result ? 500 : 200,
        headers
      });
    })()
  );
});

async function handleRequest(event: FetchEvent) {
  if (event.request.method !== "POST") {
    // Return deployment info
    return {
      project: "webhook-to-actions",
      commit: gitRepoInfo.sha,
      commitTime: gitRepoInfo.authorDate,
      buildTime: buildTime
    };
  }

  const url = new URL(event.request.url);
  const requestTriggerId = url.pathname.slice(1);

  for (const trigger of config.triggers) {
    if (trigger.id !== requestTriggerId) continue;

    const webhookSecretName = trigger.webhookSecret;
    if (!(webhookSecretName in self))
      return {
        error: `Webhook Secret ${JSON.stringify(webhookSecretName)} not found. Please add it to Worker secrets!`
      };
    const webhookSecret = self[webhookSecretName];

    const body = await event.request.text();
    if (!(await checkSignature(event.request, body, webhookSecret)))
      return {
        error: "Signature check failed. Malformed request or misconfigured secret?"
      };

    // Parse body and payload
    const parsedBody = new URLSearchParams(body);
    const payload = JSON.parse(parsedBody.get("payload"));

    return handleWebhook(
      event.request.headers.get("X-GitHub-Event"),
      payload,
      Object.fromEntries(url.searchParams),
      trigger
    );
  }

  return {
    error: "No trigger matched."
  };
}
