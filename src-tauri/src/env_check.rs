use std::process::Command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnvItem {
    pub name: String,
    pub installed: bool,
    pub required: bool,
    pub version: Option<String>,
}

#[tauri::command]
pub fn check_git_installed() -> EnvItem {
    // 使用跨平台方式直接调用 git --version
    let output = Command::new("git")
        .arg("--version")
        .output();
    
    let (installed, version) = match &output {
        Ok(output) => {
            let success = output.status.success();
            let version = if success {
                let version_str = String::from_utf8_lossy(&output.stdout);
                // 典型输出: "git version 2.x.x"
                version_str
                    .split_whitespace()
                    .nth(2)
                    .map(|v| v.to_string())
            } else {
                None
            };
            (success, version)
        },
        Err(_) => (false, None),
    };
    
    EnvItem {
        name: "Git".to_string(),
        installed,
        required: true,
        version,
    }
}

#[tauri::command]
pub fn get_env_requirements() -> Vec<EnvItem> {
    vec![check_git_installed()]
}

#[tauri::command]
pub fn install_git() -> Result<String, String> {
    // 这里只返回安装指南，实际安装需要用户手动操作
    Ok("请访问 https://git-scm.com/downloads 下载并安装Git".to_string())
}