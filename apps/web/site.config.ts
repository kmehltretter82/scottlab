import { readFileSync } from "node:fs";

interface PackageMetadata {
  readonly repository: {
    readonly url: string;
  };
}

const metadata = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
) as PackageMetadata;

function toBrowserUrl(gitUrl: string): string {
  return gitUrl.replace(/^git\+/, "").replace(/\.git$/, "");
}

export const repositoryUrl =
  process.env.VITE_REPOSITORY_URL ?? toBrowserUrl(metadata.repository.url);
