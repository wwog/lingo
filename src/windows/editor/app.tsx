import { FC, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";

interface EditorInitPayload {
  projectPath: string;
}

//#region component
export const EditorApp: FC = () => {
  const [projectPath, setProjectPath] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 监听来自父窗口的项目路径
    const unlisten = listen<EditorInitPayload>("editor-init", (event) => {
      console.log("Received project path:", event.payload.projectPath);
      setProjectPath(event.payload.projectPath);
      setIsLoading(false);
    });

    // 清理监听器
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">项目编辑器</h1>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">项目路径:</p>
        <p className="text-base font-mono bg-muted p-2 rounded">{projectPath}</p>
      </div>
    </div>
  );
};
//#endregion component
