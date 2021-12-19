# Webhook to Actions

Trigger GitHub Actions workflow with WebHook. Runs on Cloudflare Workers.

You need a free [Cloudflare Workers](https://workers.cloudflare.com/) account to deploy this project. If you are new to Cloudflare, you should create your subdomain for Cloudflare Workers in the dashboard.

# Deployment

Clone this repository. Install Node.js, Yarn and [Cloudflare Wrangler](https://developers.cloudflare.com/workers/cli-wrangler), the tool to manage your Cloudflare Workers.

> If it's your first time to use Cloudflare Wrangler, you need to login in to your Cloudflare account with `wrangler login` before deploying.

Create a `config.yaml` file:

```bash
cp config-example.yaml config.yaml
```

Edit the `config.yaml` file and follow the comments to enter the condition and workflow info of your trigger. Then build and deploy it:

```
yarn
yarn deploy
```

# Usage

### Webhook URL

After deployment, you will see the worker URL in the console output. It should be `https://webhook-to-actions.<your-subdomain>.workers.dev`. Visit the URL in browser and you'll see a JSON output with build info.

Append your trigger ID in `config.yaml` (`triggers[*].id`) to the URL. Your webhook URL is `https://webhook-to-actions.<your-subdomain>.workers.dev/<trigger-id>`.

### GitHub Token

Now create a [Personal Access Token](https://github.com/settings/tokens) in your GitHub settings and make sure to check the `repo` scope (the `workflow` scope is NOT needed).

> **Warning:** If you selected a **expiration time** for your token, remeber to update it before expiration!

After creating your token, add it to your Cloudflare Worker with (if you use a name rather than `GITHUB_TOKEN` for your trigger in your configuration file, remember to replace it here):

```
wrangler secset put GITHUB_TOKEN
```

Then paste your newly created token and press enter to upload it.

### Webhook Secret

For security, you should also generate a token for the webhook. Run `yarn secret` to generate a random secret locally. And also upload it to Cloudflare Workers:

```
wrangler secset put SECRET_TOKEN_MY_BUILD
```

This will be the token you'll enter in your webhook.

### Create Webhook

Create a webhook in your repository. Make sure the **Content Type** is `application/x-www-form-urlencoded`. After created, you can check if it runs correctly in **Recent Deliveries**.

# License

MIT
