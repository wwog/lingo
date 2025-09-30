import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export interface ProjectJsonSchema {
    name: string;
    description: string;
    tags: string[];
    repo: string;
    settings: Record<string, any>;
}

export interface ProjectJsonHandle {
    path: string;
    read(): Promise<ProjectJsonSchema>;
    write(data: ProjectJsonSchema): Promise<void>;
}

export function createProjectJsonHandle(path: string): ProjectJsonHandle {
    return {
        path,
        async read() {
            const content = await readTextFile(path);
            return JSON.parse(content || "{}") as ProjectJsonSchema;
        },
        async write(data: ProjectJsonSchema) {
            const text = JSON.stringify(data ?? {}, null, 2) + "\n";
            await writeTextFile(path, text);
        },
    };
}