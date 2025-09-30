import { readDir } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import { Command } from '@tauri-apps/plugin-shell'

export async function isProjectDir(path: string): Promise<boolean> {
    try {
        const entries = await readDir(path);
        const entryByName = new Map(entries.map((entry) => [entry.name, entry]));

        const lingoDirEntry = entryByName.get(".lingo");
        if (!lingoDirEntry?.isDirectory) {
            return false;
        }

        const lingoDirPath = await join(path, ".lingo");
        const lingoEntries = await readDir(lingoDirPath);

        const hasProjectJson = lingoEntries.some(
            (entry) => entry.isFile && entry.name === "project.json",
        );

        const hasManifestJson = lingoEntries.some(
            (entry) => entry.isFile && entry.name === "manifest.json",
        );

        if (!hasProjectJson || !hasManifestJson) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

export async function isGitProject(path: string): Promise<boolean> {
    const result = await Command.create('git', ['-C', path, 'rev-parse', '--is-inside-work-tree']).execute();
    console.log(result);
    return result.code === 0;
}