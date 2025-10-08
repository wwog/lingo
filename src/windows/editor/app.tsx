import { FC } from "react";
import { useEditorParams } from "./hooks/use-editor-params";

//#region component
export const EditorApp: FC = () => {
  const params = useEditorParams();

  if (!params) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">未找到项目路径</div>
      </div>
    );
  }

  const { projectPath } = params;

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
