/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />

import type { Config } from "./config";

declare global {
  declare var self: ServiceWorkerGlobalScope & typeof globalThis;
  declare var config: Config;
  declare var gitRepoInfo: ReturnType<typeof import("git-repo-info")>;
  declare var buildTime: string;
}
