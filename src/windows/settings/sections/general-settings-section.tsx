import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DirInput } from "@/components/dir_input";
import { Label } from "@/components/ui/label";
import { FolderOpen } from "lucide-react";
import { getDefaultFolder, setDefaultFolder as saveDefaultFolder } from "@/lib/settings";
import { documentDir } from "@tauri-apps/api/path";

export function GeneralSettingsSection() {
  const [defaultFolder, setDefaultFolder] = useState<string>("");

  // 从localStorage加载默认文件夹设置，如果没有则使用文档文件夹
  useEffect(() => {
    const initializeDefaultFolder = async () => {
      const saved = getDefaultFolder();
      if (saved) {
        setDefaultFolder(saved);
      } else {
        // 如果没有保存的设置，使用文档文件夹作为默认值
        try {
          const docDir = await documentDir();
          setDefaultFolder(docDir);
        } catch (error) {
          console.error("无法获取文档文件夹路径:", error);
        }
      }
    };

    initializeDefaultFolder();
  }, []);

  // 自动保存
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDefaultFolder(defaultFolder);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [defaultFolder]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">基础设置</h2>
        <p className="text-sm text-muted-foreground mt-1">
          配置应用程序的基本选项和默认行为
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="h-4 w-4" />
            默认项目文件夹
          </CardTitle>
          <CardDescription>
            设置打开和创建项目时默认选中的文件夹路径
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-folder">文件夹路径</Label>
            <DirInput
              value={defaultFolder}
              onChange={setDefaultFolder}
              placeholder="选择默认文件夹"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {defaultFolder ? (
              <span>当前默认路径: {defaultFolder}</span>
            ) : (
              <span>未设置默认路径，将使用系统默认位置</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

