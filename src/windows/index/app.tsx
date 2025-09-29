import { CloneRepoCard } from "@/components/clone-repo-card";
import { NewProjectCard } from "@/components/new-project-card";
import { OpenProjectCard } from "@/components/open-project-card";
import { RecentProjectsCard } from "@/components/recent-projects-card";
import { useEffect, type FC, type ReactNode } from "react";
import { openSettingsWindow } from "../settings/mod";
import { Badge } from "@/components/ui/badge";
import { AppLogo } from "@/components/app-logo";
import { Settings } from "lucide-react";

interface StartAppProps {
  children?: ReactNode;
}
export const StartApp: FC<StartAppProps> = (props) => {
  function handleCreateProject(projectName: string, projectPath: string): void {
    throw new Error("Function not implemented.");
  }

  function handleOpenProject(): void {
    throw new Error("Function not implemented.");
  }

  function handleCloneRepository(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex flex-col w-full h-full justify-center px-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <AppLogo />

          <h1 className="text-2xl font-semibold">LingoIDE</h1>
          <Badge variant="secondary" className="ml-2">
            <span className="mr-1">⚡</span>
            Quick Start
          </Badge>
        </div>
        <button
          onClick={() => openSettingsWindow()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-sm"
          aria-label="设置"
        >
          <Settings className="h-4 w-4" /> 设置
        </button>
      </div>
      <div className="grid grid-cols-5 gap-4 ">
        <div className="col-span-3 space-y-3">
          <NewProjectCard onCreate={handleCreateProject} />
          <OpenProjectCard onOpenProject={handleOpenProject} />
          <CloneRepoCard onClone={handleCloneRepository} />
        </div>

        <div className="col-span-2 space-y-6">
          <RecentProjectsCard onOpenProject={handleOpenProject} />
        </div>
      </div>
    </div>
  );
};
