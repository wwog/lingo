import { join } from "@tauri-apps/api/path";
import { mkdir, writeTextFile } from "@tauri-apps/plugin-fs";
import { createProjectJsonHandle, ProjectJsonHandle } from "./project-json";
import { createProjectManifestHandle, ProjectManifestHandle } from "./project-manifest";
import { isGitProject } from "./utils";

export interface Project {
    projectDir: string;
    lingoDirPath: string;
    projectJson: ProjectJsonHandle;
    projectManifest: ProjectManifestHandle;
    gitProject: boolean;
}

export async function openProject(projectDir: string): Promise<Project> {
    // 优先使用新的 lingo 文件夹，兼容旧的 .lingo
    const lingoDirPath = await join(projectDir, "lingo");

    const projectJsonPath = await join(lingoDirPath, "project.json");
    const manifestJsonPath = await join(lingoDirPath, "manifest.json");
    const projectJson = createProjectJsonHandle(projectJsonPath);
    const projectManifest = createProjectManifestHandle(manifestJsonPath);
    const gitProject = await isGitProject(projectDir);
    return { projectDir, projectJson, projectManifest, gitProject, lingoDirPath };
}


export interface CreateProjectOptions {
    projectName: string;
    projectDir: string;
    supportLanguages: string[];
}
export async function createProject(options: CreateProjectOptions): Promise<Project> {
    const { projectDir, projectName, supportLanguages } = options;

    // 使用普通文件夹名称而不是 .lingo，避免隐藏文件夹权限问题
    const lingoDirPath = await join(projectDir, "lingo");
    const localesDirPath = await join(projectDir, "locales");

    await mkdir(projectDir);
    await mkdir(lingoDirPath);
    await mkdir(localesDirPath);

    const generateId = () => {
        try {
            // @ts-ignore - runtime may provide crypto in webview
            return typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `lingo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        } catch {
            return `lingo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        }
    };

    const defaultLanguage = supportLanguages && supportLanguages.length > 0
        ? supportLanguages[0]
        : "en-US";

    const projectJsonPath = await join(lingoDirPath, "project.json");
    const manifestJsonPath = await join(lingoDirPath, "manifest.json");
    const keysJsonPath = await join(localesDirPath, "keys.json");

    const projectJsonContent = {
        name: projectName,
        description: "",
        owner: "",
        tags: [],
        repo: "",
        settings: {},
        createdAt: new Date().toISOString(),
    } as const;

    const manifestJsonContent = {
        id: generateId(),
        version: 1,
        defaultLanguage,
        languages: supportLanguages ?? [],
        modules: [],
        updatedAt: new Date().toISOString(),
    } as const;

    await writeTextFile(projectJsonPath, JSON.stringify(projectJsonContent, null, 2) + "\n");
    await writeTextFile(manifestJsonPath, JSON.stringify(manifestJsonContent, null, 2) + "\n");
    await writeTextFile(keysJsonPath, JSON.stringify({}, null, 2) + "\n");

    for (const lang of supportLanguages) {
        const langDir = await join(localesDirPath, lang);
        await mkdir(langDir, { recursive: true });
        const messagesPath = await join(langDir, "messages.json");
        await writeTextFile(messagesPath, JSON.stringify({}, null, 2) + "\n");
    }

    return openProject(projectDir);
}