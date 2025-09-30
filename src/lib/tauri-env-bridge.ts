import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export interface EnvItem {
  name: string;
  installed: boolean;
  required: boolean;
  version?: string;
}

const INSTALL_OUTPUT_EVENT = "install-output";

export async function fetchEnvRequirements(): Promise<EnvItem[]> {
  const requirements = await invoke<EnvItem[]>("get_env_requirements");
  return requirements;
}

export async function installGitWithProgress(): Promise<string> {
  return invoke<string>("install_git_with_progress");
}

export function listenInstallOutput(
  handler: (message: string) => void
): Promise<UnlistenFn> {
  return listen<string>(INSTALL_OUTPUT_EVENT, (event) => {
    handler(event.payload);
  });
}

