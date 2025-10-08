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
import { isProjectDir } from "@/lib/project/utils";
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
      
      const loadingToast = toast.loading("正在创建项目...", {
        description: `项目名称: ${projectName}`,
      });

      // 调用创建项目函数
      const project = await createProject({
        projectName,
        projectDir: fullProjectPath,
        supportLanguages,
      });

      toast.success("✨ 项目创建成功！", {
        id: loadingToast,
        description: `已在 ${fullProjectPath} 创建项目`,
        duration: 4000,
      });

      console.log('项目创建成功:', project);
      
      // 自动打开新创建的项目
      const { openEditorWindow } = await import("../editor/mod");
      openEditorWindow({ projectPath: fullProjectPath });
      
    } catch (error) {
      console.error('创建项目失败:', error);
      
      let errorMessage = "未知错误";
      if (error instanceof Error) {
        errorMessage = error.message;
        // 特殊处理权限错误
        if (errorMessage.includes("forbidden path")) {
          errorMessage = "文件系统权限不足。请重启应用或选择其他目录。";
        }
      }
      
      toast.error("❌ 创建项目失败", {
        description: errorMessage,
        duration: 6000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenProject = async (projectPath?: string): Promise<void> => {
    let selectedPath: string | undefined = undefined;
    
    // 检查传入的参数是否是有效的字符串路径（而不是事件对象）
    if (typeof projectPath === 'string' && projectPath.length > 0) {
      selectedPath = projectPath;
    }
    
    // 如果没有提供项目路径，则打开文件夹选择对话框
    if (!selectedPath) {
      const result = await open({
        directory: true,
        multiple: false,
        title: "Open Project",
      });
      
      if (!result) {
        return;
      }
      
      selectedPath = result;
    }
    
    try {
      // 验证是否是有效的 Lingo 项目
      const isValid = await isProjectDir(selectedPath);
      
      if (!isValid) {
        toast.error("❌ 无效的项目", {
          description: "所选文件夹不是有效的 Lingo 项目。请确保包含 lingo/project.json 和 lingo/manifest.json 文件。",
          duration: 6000,
        });
        return;
      }
      
      console.log('Opening project:', selectedPath);
      
      // 导入并打开编辑器窗口
      const { openEditorWindow } = await import("../editor/mod");
      openEditorWindow({ projectPath: selectedPath });
    } catch (error) {
      console.error('打开项目失败:', error);
      
      let errorMessage = "未知错误";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error("❌ 打开项目失败", {
        description: errorMessage,
        duration: 6000,
      });
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
