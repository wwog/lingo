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
  
  const webview = new WebviewWindow(windowLabel, {
    resizable: true,
    title: `LingoIDE - ${projectPath}`,
    width,
    height,
    visible: false,
    backgroundColor: "#000000",
    url: "/editor.html",
  });

  webview.once("tauri://created", async function () {
    // webview successfully created
    console.log("Editor window successfully created:", windowLabel);
    
    // 等待窗口准备好后发送项目路径
    // 使用 setTimeout 确保窗口已完全加载
    setTimeout(async () => {
      try {
        await webview.emit("editor-init", { projectPath });
        console.log("Project path sent to editor:", projectPath);
      } catch (error) {
        console.error("Failed to send project path to editor:", error);
      }
    }, 100);
  });
  
  webview.once("tauri://error", function (e) {
    // an error happened creating the webview
    console.error("Error creating editor window:", e);
  });
}
