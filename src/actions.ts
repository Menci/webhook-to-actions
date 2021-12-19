export async function workflowDispatch(
  token: string,
  owner: string,
  repo: string,
  workflow: string,
  ref: string,
  inputs: Record<string, string>
) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
    {
      method: "POST",
      body: JSON.stringify({
        ref,
        inputs
      }),
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Menci/webhook-to-actions#" + gitRepoInfo.abbreviatedSha,
        Accept: "application/vnd.github.v3+json",
        Authorization: `Token ${token}`
      }
    }
  );

  if (response.status === 204) return {};

  let responseBody = await response.text();
  try {
    responseBody = JSON.parse(responseBody);
  } catch (e) {}

  return {
    error: "GitHub API returned a non-204 status code.",
    responseBody
  };
}
