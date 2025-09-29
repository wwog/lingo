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
    let output = Command::new("sh")
        .arg("-c")
        .arg("command -v git && git --version")
        .output();
    
    let (installed, version) = match &output {
        Ok(output) => {
            let success = output.status.success();
            let version = if success {
                let version_str = String::from_utf8_lossy(&output.stdout);
                // 提取版本号，格式通常是 "git version 2.x.x"
                version_str
                    .lines()
                    .last()
                    .and_then(|line| line.split_whitespace().nth(2))
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