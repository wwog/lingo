import { useEffect, useState } from "react";

export interface EditorParams {
  projectPath: string;
}

/**
 * 从 URL 参数中获取编辑器窗口的参数
 */
export function useEditorParams() {
  const [params, setParams] = useState<EditorParams | null>(null);

  useEffect(() => {
    // 从 URL 参数中获取项目路径
    const urlParams = new URLSearchParams(window.location.search);
    const projectPathParam = urlParams.get("projectPath");

    if (projectPathParam) {
      const decodedPath = decodeURIComponent(projectPathParam);
      console.log("Received project path from URL:", decodedPath);
      
      setParams({
        projectPath: decodedPath,
      });
    } else {
      console.error("No project path found in URL");
      setParams(null);
    }
  }, []);

  return params;
}

