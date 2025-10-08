import { FC } from "react";
import { useEditorParams } from "./hooks/use-editor-params";
import { Editor } from "./components/editor";

//#region component
export const EditorApp: FC = () => {
  const params = useEditorParams();

  if (!params) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-destructive">未找到项目路径</div>
      </div>
    );
  }

  const { projectPath } = params;

  return <Editor projectPath={projectPath} />;
};
//#endregion component
