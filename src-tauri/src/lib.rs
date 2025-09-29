// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod env_check;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            env_check::check_git_installed,
            env_check::get_env_requirements,
            env_check::install_git
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
