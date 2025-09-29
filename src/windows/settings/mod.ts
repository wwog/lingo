import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export function openSettingsWindow() {
  const webview = new WebviewWindow("settings", {
    resizable: false,
    title: "",
    width: 640,
    height: 450,
    visible: false,
    backgroundColor: "#000000",
    url: "/settings.html",
  });

  webview.once("tauri://created", function () {
    // webview successfully created
    console.log("webview successfully created");
  });
  webview.once("tauri://error", function (e) {
    // an error happened creating the webview
    console.error("an error happened creating the webview", e);
  });
}
