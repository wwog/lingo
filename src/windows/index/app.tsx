import { CloneRepoCard } from "@/components/clone-repo-card";
import { NewProjectCard } from "@/components/new-project-card";
import { OpenProjectCard } from "@/components/open-project-card";
import { RecentProjectsCard } from "@/components/recent-projects-card";
import { type FC, useState } from "react";
import { openSettingsWindow } from "../settings/mod";
import { Badge } from "@/components/ui/badge";
import { AppLogo } from "@/components/app-logo";
import { Settings } from "lucide-react";
import { open } from '@tauri-apps/plugin-dialog';
import { createProject } from "@/lib/project/project";
import { join } from "@tauri-apps/api/path";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";


export const StartApp: FC = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async (
    projectName: string, 
    projectPath: string, 
    _defaultLanguage: string, 
    supportLanguages: string[]
  ): Promise<void> => {
    try {
      setIsCreating(true);
      
      // 创建项目完整路径
      const fullProjectPath = await join(projectPath, projectName);
      
      toast.info("正在创建项目...", {
        description: `项目名称: ${projectName}`,
      });

      // 调用创建项目函数
      const project = await createProject({
        projectName,
        projectDir: fullProjectPath,
        supportLanguages,
      });

      toast.success("项目创建成功！", {
        description: `已在 ${fullProjectPath} 创建项目`,
        duration: 5000,
      });

      console.log('项目创建成功:', project);
      
      // TODO: 跳转到项目编辑页面或打开项目
      
    } catch (error) {
      console.error('创建项目失败:', error);
      toast.error("创建项目失败", {
        description: error instanceof Error ? error.message : "未知错误",
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenProject = async (): Promise<void> => {
    const result = await open({
      directory: true,
      multiple: false,
      title: "Open Project",
    })
    if (result) {
      console.log('result', result);
    }
  }

  function handleCloneRepository(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <Toaster />
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
          <NewProjectCard onCreate={handleCreateProject} disabled={isCreating} />
          <OpenProjectCard onOpenProject={handleOpenProject} />
          <CloneRepoCard onClone={handleCloneRepository} />
        </div>

        <div className="col-span-2 space-y-6">
          <RecentProjectsCard onOpenProject={handleOpenProject} />
        </div>
      </div>
    </div>
    </>
  );
};
