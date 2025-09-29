// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::Manager;

fn main() {
    #[cfg(debug_assertions)]
    {
        // 在开发模式下自动打开 DevTools
        tauri::Builder::default()
            .setup(|app| {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                }
                Ok(())
            })
            .run(tauri::generate_context!())
            .expect("error while running tauri application");
        return;
    }

    // 非开发模式维持原有启动路径
    lingo_lib::run()
}
