import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export interface EditorWindowProps {
  projectPath: string;
  width?: number;
  height?: number;
}

export function openEditorWindow(props: EditorWindowProps) {
  const { projectPath, width = 1280, height = 920 } = props;
  
  // 生成唯一的窗口标签，支持打开多个项目
  const timestamp = Date.now();
  const windowLabel = `editor-${timestamp}`;
  
  // 通过 URL 参数传递项目路径，避免事件时序问题
  const encodedPath = encodeURIComponent(projectPath);
  
  const webview = new WebviewWindow(windowLabel, {
    resizable: true,
    title: `LingoIDE - ${projectPath}`,
    width,
    height,
    visible: false,
    backgroundColor: "#000000",
    url: `/editor.html?projectPath=${encodedPath}`,
  });

  webview.once("tauri://created", function () {
    console.log("Editor window successfully created:", windowLabel);
  });
  
  webview.once("tauri://error", function (e) {
    console.error("Error creating editor window:", e);
  });
}
