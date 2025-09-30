import { join } from "@tauri-apps/api/path";
import { isGitProject, isProjectDir } from "./utils";


export interface ProjectOptions {
    projectPath: string;
}

export class Project {
    public projectPath: string;
    public projectJsonPath!: string;
    public manifestJsonPath!: string;
    /** 是否是git项目 */
    public isGitProject!: boolean;


    static async create(path: string): Promise<Project> {
        const isProject = await isProjectDir(path);
        if (!isProject) {
            throw new Error("Not a project directory");
        }
        const project = new Project({ projectPath: path });
        await project.load();
        return project;
    }

    private constructor(options: ProjectOptions) {
        this.projectPath = options.projectPath;
    }

    async load(): Promise<void> {
        this.projectJsonPath = await join(this.projectPath, "project.json");
        this.manifestJsonPath = await join(this.projectPath, "manifest.json");
        this.isGitProject = await isGitProject(this.projectPath);
    }



}