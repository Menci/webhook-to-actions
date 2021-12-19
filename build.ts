import yaml from "js-yaml";
import fs from "fs";
import gitRepoInfo from "git-repo-info";

import * as esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "browser",
  outfile: "dist/index.js",
  logLevel: "info",
  define: {
    process: JSON.stringify({ env: { NODE_ENV: "production" } }),
    config: JSON.stringify(yaml.load(fs.readFileSync("config.yaml").toString())),
    gitRepoInfo: JSON.stringify(gitRepoInfo()),
    buildTime: JSON.stringify(new Date())
  }
});
