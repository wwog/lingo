import { ProjectJson } from "./project-json";
import { ProjectManifest } from "./project-manifest";

export interface Project {
    projectPath: string;
    projectJson: ProjectJson;
    projectManifest: ProjectManifest;
    isGitProject: boolean;
}

