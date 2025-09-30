// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod env_check;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            env_check::check_git_installed,
            env_check::get_env_requirements,
            env_check::install_git_with_progress
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
