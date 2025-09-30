import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export interface ProjectManifestSchema {
    id: string;
    version: number;
    defaultLanguage: string;
    languages: string[];
    modules: string[];
    updatedAt?: string;
}

export interface ProjectManifestHandle {
    path: string;
    read(): Promise<ProjectManifestSchema>;
    write(data: ProjectManifestSchema): Promise<void>;
}

export function createProjectManifestHandle(path: string): ProjectManifestHandle {
    return {
        path,
        async read() {
            const content = await readTextFile(path);
            return JSON.parse(content || "{}") as ProjectManifestSchema;
        },
        async write(data: ProjectManifestSchema) {
            const text = JSON.stringify(data ?? {}, null, 2) + "\n";
            await writeTextFile(path, text);
        },
    };
}