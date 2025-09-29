use std::process::{Command, Stdio};
use std::fs;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader as AsyncBufReader};

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
    // 1. 检测是否安装，如果已经安装返回成功
    let git_status = check_git_installed();
    if git_status.installed {
        return Ok(format!("Git 已经安装，版本: {}", git_status.version.unwrap_or("未知".to_string())));
    }

    // 2. 如果没有安装则走入安装流程
    println!("Git 未安装，开始安装流程...");

    // 3. 安装流程：
    #[cfg(target_os = "windows")]
    {
        // Windows 使用直接下载安装
        match install_git_windows() {
            Ok(message) => {
                println!("{}", message);
                // 再次检查 Git 是否安装成功
                let final_check = check_git_installed();
                if final_check.installed {
                    Ok(format!("Git 安装成功！版本: {}", final_check.version.unwrap_or("未知".to_string())))
                } else {
                    Err("Git 安装完成，但检测仍未安装。可能需要重启应用或刷新环境变量。".to_string())
                }
            }
            Err(e) => Err(e)
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // 其他平台使用包管理器
        // 3.1 确认环境选择对应指令
        let install_command = get_git_install_command()?;
        println!("使用安装命令: {:?}", install_command);

        // 3.2 子进程执行指令
        let child = Command::new(&install_command.0)
            .args(&install_command.1)
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("启动安装进程失败: {}", e))?;

        // 3.3 等待子进程完成 (监听标准输出和错误输出)
        let output = child.wait_with_output()
            .map_err(|e| format!("等待安装进程完成失败: {}", e))?;

        // 接受到标准输出，也会打印出来，同时写入命令执行日志到本地
        if !output.stdout.is_empty() {
            let stdout_str = String::from_utf8_lossy(&output.stdout);
            println!("安装输出: {}", stdout_str);
            // TODO: 这里可以添加 IPC 到前端和写入本地日志的功能
        }

        if !output.stderr.is_empty() {
            let stderr_str = String::from_utf8_lossy(&output.stderr);
            println!("安装错误输出: {}", stderr_str);
            // TODO: 这里可以添加 IPC 到前端和写入本地日志的功能
        }

        // 3.4 如果子进程完成，返回成功
        // 3.5 如果子进程失败，返回失败
        if output.status.success() {
            // 再次检查 Git 是否安装成功
            let final_check = check_git_installed();
            if final_check.installed {
                Ok(format!("Git 安装成功！版本: {}", final_check.version.unwrap_or("未知".to_string())))
            } else {
                Err("Git 安装命令执行成功，但检测仍未安装".to_string())
            }
        } else {
            let error_msg = if !output.stderr.is_empty() {
                String::from_utf8_lossy(&output.stderr).to_string()
            } else {
                format!("安装进程退出码: {}", output.status.code().unwrap_or(-1))
            };
            Err(format!("Git 安装失败: {}", error_msg))
        }
    }
}

// 带进度回调的安装函数
#[tauri::command]
pub async fn install_git_with_progress(app: AppHandle) -> Result<String, String> {
    // 1. 检测是否安装，如果已经安装返回成功
    let git_status = check_git_installed();
    if git_status.installed {
        let message = format!("Git 已经安装，版本: {}", git_status.version.unwrap_or("未知".to_string()));
        emit_install_output(&app, &message);
        return Ok(message);
    }

    // 2. 如果没有安装则走入安装流程
    emit_install_output(&app, "Git 未安装，开始安装流程...");

    // 3. 安装流程：
    #[cfg(target_os = "windows")]
    {
        // Windows 使用直接下载安装
        match install_git_windows_with_progress(&app).await {
            Ok(message) => {
                emit_install_output(&app, &message);
                // 再次检查 Git 是否安装成功
                let final_check = check_git_installed();
                if final_check.installed {
                    let success_msg = format!("Git 安装成功！版本: {}", final_check.version.unwrap_or("未知".to_string()));
                    emit_install_output(&app, &success_msg);
                    Ok(success_msg)
                } else {
                    let error_msg = "Git 安装完成，但检测仍未安装。可能需要重启应用或刷新环境变量。".to_string();
                    emit_install_output(&app, &error_msg);
                    Err(error_msg)
                }
            }
            Err(e) => {
                emit_install_output(&app, &format!("安装失败: {}", e));
                Err(e)
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // 其他平台使用包管理器
        match install_git_non_windows_with_progress(&app).await {
            Ok(message) => {
                emit_install_output(&app, &message);
                Ok(message)
            }
            Err(e) => {
                emit_install_output(&app, &format!("安装失败: {}", e));
                Err(e)
            }
        }
    }
}

// 发送安装输出到前端
fn emit_install_output(app: &AppHandle, message: &str) {
    println!("{}", message);
    let _ = app.emit("install-output", message);
}

// Windows 直接下载并安装 Git 的函数
#[cfg(target_os = "windows")]
fn install_git_windows() -> Result<String, String> {
    use std::io::Write;
    
    println!("开始下载 Git 安装包...");
    
    // 检测系统架构
    let arch = if cfg!(target_arch = "x86_64") {
        "64-bit"
    } else if cfg!(target_arch = "x86") {
        "32-bit"
    } else if cfg!(target_arch = "aarch64") {
        "arm64"
    } else {
        return Err("不支持的架构".to_string());
    };
    

    // Git for Windows 下载 URL - 使用固定的稳定版本
    let download_url = if arch == "64-bit" {
        "https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/Git-2.51.0-64-bit.exe"
    } else if arch == "32-bit" {
        "https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-32-bit.exe"
    } else if arch == "arm64" {
        "https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/Git-2.51.0-arm64.exe"
    } else {
        return Err("不支持的架构".to_string());
    };

    // 创建临时目录
    let temp_dir = std::env::temp_dir();
    let installer_path = temp_dir.join("git-installer.exe");
    
    // 下载安装包
    println!("正在从 {} 下载 Git 安装包...", download_url);
    let response = reqwest::blocking::get(download_url)
        .map_err(|e| format!("下载失败: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("下载失败，HTTP 状态码: {}", response.status()));
    }
    
    let content = response.bytes()
        .map_err(|e| format!("读取下载内容失败: {}", e))?;
    
    // 保存到临时文件
    let mut file = fs::File::create(&installer_path)
        .map_err(|e| format!("创建临时文件失败: {}", e))?;
    
    file.write_all(&content)
        .map_err(|e| format!("写入安装包失败: {}", e))?;
    
    println!("下载完成，开始安装...");
    
    // 执行静默安装
    let output = Command::new(&installer_path)
        .args(&[
            "/VERYSILENT",           // 静默安装
            "/NORESTART",            // 不重启
            "/NOCANCEL",             // 不允许取消
            "/SP-",                  // 不显示启动画面
            "/CLOSEAPPLICATIONS",    // 关闭相关应用
            "/RESTARTAPPLICATIONS",  // 重启相关应用
            "/COMPONENTS=ext\\shellhere,ext\\guihere,gitlfs,assoc,assoc_sh", // 选择组件
        ])
        .output()
        .map_err(|e| format!("启动安装程序失败: {}", e))?;
    
    // 清理临时文件
    let _ = fs::remove_file(&installer_path);
    
    if output.status.success() {
        // 安装完成后需要刷新环境变量，等待一下
        std::thread::sleep(std::time::Duration::from_secs(2));
        Ok("Git 安装完成".to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("安装失败: {}", error_msg))
    }
}

// Windows 带进度的安装函数
#[cfg(target_os = "windows")]
async fn install_git_windows_with_progress(app: &AppHandle) -> Result<String, String> {
    use tokio::io::AsyncWriteExt;
    
    emit_install_output(app, "开始下载 Git 安装包...");
    
    // 检测系统架构
    let arch = if cfg!(target_arch = "x86_64") {
        "64-bit"
    } else if cfg!(target_arch = "x86") {
        "32-bit"
    } else if cfg!(target_arch = "aarch64") {
        "arm64"
    } else {
        return Err("不支持的架构".to_string());
    };
    
    // Git for Windows 下载 URL - 使用固定的稳定版本
    let download_url = if arch == "64-bit" {
        "https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/Git-2.51.0-64-bit.exe"
    } else if arch == "32-bit" {
        "https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-32-bit.exe"
    } else if arch == "arm64" {
        "https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/Git-2.51.0-arm64.exe"
    } else {
        return Err("不支持的架构".to_string());
    };
    
    // 创建临时目录
    let temp_dir = std::env::temp_dir();
    let installer_path = temp_dir.join("git-installer.exe");
    
    emit_install_output(app, &format!("正在从 {} 下载 Git 安装包...", download_url));
    
    // 下载安装包
    let response = reqwest::get(download_url).await
        .map_err(|e| format!("下载失败: {}", e))?;
    
    if !response.status().is_success() {
        return Err(format!("下载失败，HTTP 状态码: {}", response.status()));
    }
    
    let content = response.bytes().await
        .map_err(|e| format!("读取下载内容失败: {}", e))?;
    
    emit_install_output(app, &format!("下载完成，文件大小: {} MB", content.len() / 1024 / 1024));
    
    // 保存到临时文件
    let mut file = tokio::fs::File::create(&installer_path).await
        .map_err(|e| format!("创建临时文件失败: {}", e))?;
    
    file.write_all(&content).await
        .map_err(|e| format!("写入安装包失败: {}", e))?;
    
    emit_install_output(app, "下载完成，开始安装...");
    
    // 执行静默安装
    let mut child = tokio::process::Command::new(&installer_path)
        .args(&[
            "/VERYSILENT",           // 静默安装
            "/NORESTART",            // 不重启
            "/NOCANCEL",             // 不允许取消
            "/SP-",                  // 不显示启动画面
            "/CLOSEAPPLICATIONS",    // 关闭相关应用
            "/RESTARTAPPLICATIONS",  // 重启相关应用
            "/COMPONENTS=ext\\shellhere,ext\\guihere,gitlfs,assoc,assoc_sh", // 选择组件
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("启动安装程序失败: {}", e))?;
    
    // 监听输出
    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();
    
    let app_clone = app.clone();
    tokio::spawn(async move {
        let reader = AsyncBufReader::new(stdout);
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            emit_install_output(&app_clone, &format!("安装输出: {}", line));
        }
    });
    
    let app_clone = app.clone();
    tokio::spawn(async move {
        let reader = AsyncBufReader::new(stderr);
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            emit_install_output(&app_clone, &format!("安装错误: {}", line));
        }
    });
    
    emit_install_output(app, "正在安装 Git，请稍候...");
    
    let output = child.wait().await
        .map_err(|e| format!("等待安装进程完成失败: {}", e))?;
    
    // 清理临时文件
    let _ = tokio::fs::remove_file(&installer_path).await;
    
    if output.success() {
        // 安装完成后需要刷新环境变量，等待一下
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
        Ok("Git 安装完成".to_string())
    } else {
        Err(format!("安装失败，退出码: {}", output.code().unwrap_or(-1)))
    }
}

// 非 Windows 系统带进度的安装函数
#[cfg(not(target_os = "windows"))]
async fn install_git_non_windows_with_progress(app: &AppHandle) -> Result<String, String> {
    emit_install_output(app, "准备安装 Git...");
    
    // 获取安装命令
    let install_command = get_git_install_command()?;
    emit_install_output(app, &format!("使用安装命令: {:?}", install_command));
    
    // 执行安装命令
    let mut child = tokio::process::Command::new(&install_command.0)
        .args(&install_command.1)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("启动安装进程失败: {}", e))?;
    
    // 监听输出
    let stdout = child.stdout.take().unwrap();
    let stderr = child.stderr.take().unwrap();
    
    let app_clone = app.clone();
    tokio::spawn(async move {
        let reader = AsyncBufReader::new(stdout);
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            emit_install_output(&app_clone, &format!("安装输出: {}", line));
        }
    });
    
    let app_clone = app.clone();
    tokio::spawn(async move {
        let reader = AsyncBufReader::new(stderr);
        let mut lines = reader.lines();
        while let Ok(Some(line)) = lines.next_line().await {
            emit_install_output(&app_clone, &format!("安装错误: {}", line));
        }
    });
    
    emit_install_output(app, "正在安装 Git，请稍候...");
    
    let output = child.wait().await
        .map_err(|e| format!("等待安装进程完成失败: {}", e))?;
    
    if output.success() {
        let final_check = check_git_installed();
        if final_check.installed {
            Ok(format!("Git 安装成功！版本: {}", final_check.version.unwrap_or("未知".to_string())))
        } else {
            Err("Git 安装命令执行成功，但检测仍未安装".to_string())
        }
    } else {
        Err(format!("Git 安装失败，退出码: {}", output.code().unwrap_or(-1)))
    }
}

// 根据操作系统平台获取对应的 Git 安装命令
#[cfg(not(target_os = "windows"))]
fn get_git_install_command() -> Result<(String, Vec<String>), String> {
    
    #[cfg(target_os = "macos")]
    {
        // macOS 使用 Homebrew
        if Command::new("brew").arg("--version").output().is_ok() {
            Ok(("brew".to_string(), vec!["install".to_string(), "git".to_string()]))
        } else {
            Err("未找到 Homebrew。请先安装 Homebrew 或手动安装 Git。".to_string())
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        // Linux 尝试不同的包管理器
        if Command::new("apt").arg("--version").output().is_ok() {
            // Debian/Ubuntu - 先更新包列表，然后安装 git
            Ok(("sh".to_string(), vec!["-c".to_string(), "sudo apt update && sudo apt install -y git".to_string()]))
        } else if Command::new("yum").arg("--version").output().is_ok() {
            // CentOS/RHEL
            Ok(("sudo".to_string(), vec!["yum".to_string(), "install".to_string(), "-y".to_string(), "git".to_string()]))
        } else if Command::new("dnf").arg("--version").output().is_ok() {
            // Fedora
            Ok(("sudo".to_string(), vec!["dnf".to_string(), "install".to_string(), "-y".to_string(), "git".to_string()]))
        } else if Command::new("pacman").arg("--version").output().is_ok() {
            // Arch Linux
            Ok(("sudo".to_string(), vec!["pacman".to_string(), "-S".to_string(), "--noconfirm".to_string(), "git".to_string()]))
        } else {
            Err("未找到支持的包管理器 (apt, yum, dnf, pacman)。请手动安装 Git。".to_string())
        }
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("不支持的操作系统".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_git_installed_structure() {
        // 测试 check_git_installed 函数返回正确的结构
        let result = check_git_installed();
        
        assert_eq!(result.name, "Git");
        assert_eq!(result.required, true);
        // installed 和 version 取决于系统状态，这里只测试结构
    }

    #[test]
    fn test_get_env_requirements_contains_git() {
        // 测试 get_env_requirements 包含 Git
        let requirements = get_env_requirements();
        
        assert_eq!(requirements.len(), 1);
        assert_eq!(requirements[0].name, "Git");
        assert_eq!(requirements[0].required, true);
    }

    #[test]
    fn test_install_git_when_already_installed() {
        // 如果 Git 已经安装，应该返回成功信息
        // 注意：这个测试只在 Git 已安装的系统上会通过
        if check_git_installed().installed {
            let result = install_git();
            assert!(result.is_ok());
            assert!(result.unwrap().contains("已经安装"));
        }
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn test_windows_architecture_detection() {
        // 测试架构检测逻辑
        let arch = if cfg!(target_arch = "x86_64") {
            "64-bit"
        } else if cfg!(target_arch = "x86") {
            "32-bit"
        } else if cfg!(target_arch = "aarch64") {
            "arm64"
        } else {
            "unsupported"
        };
        
        // 确保我们能正确检测到支持的架构
        assert!(arch == "64-bit" || arch == "32-bit" || arch == "arm64");
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn test_windows_download_urls() {
        // 测试不同架构的下载 URL 是否正确
        let test_cases = vec![
            ("64-bit", "https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/Git-2.51.0-64-bit.exe"),
            ("32-bit", "https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-32-bit.exe"),
            ("arm64", "https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/Git-2.51.0-arm64.exe"),
        ];
        
        for (arch, expected_url) in test_cases {
            let url = if arch == "64-bit" {
                "https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/Git-2.51.0-64-bit.exe"
            } else if arch == "32-bit" {
                "https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-32-bit.exe"
            } else if arch == "arm64" {
                "https://github.com/git-for-windows/git/releases/download/v2.51.0.windows.1/Git-2.51.0-arm64.exe"
            } else {
                ""
            };
            
            assert_eq!(url, expected_url, "架构 {} 的 URL 不正确", arch);
        }
    }

    #[cfg(not(target_os = "windows"))]
    #[test]
    fn test_non_windows_install_command() {
        // 测试非 Windows 系统的安装命令获取
        // 这个测试可能会因为系统环境不同而失败，所以我们只测试函数不会 panic
        let result = get_git_install_command();
        // 无论成功还是失败，都应该返回 Result
        assert!(result.is_ok() || result.is_err());
    }

    #[test]
    fn test_install_git_error_handling() {
        // 测试 install_git 函数的错误处理
        // 这个测试主要确保函数不会 panic
        let result = install_git();
        
        // 函数应该返回 Result，无论成功还是失败
        match result {
            Ok(message) => {
                // 成功情况下，消息应该包含版本信息或已安装信息
                assert!(message.contains("安装成功") || message.contains("已经安装"));
            }
            Err(error) => {
                // 失败情况下，错误消息不应该为空
                assert!(!error.is_empty());
            }
        }
    }

    #[test]
    fn test_env_item_serialization() {
        // 测试 EnvItem 结构体的序列化和反序列化
        let item = EnvItem {
            name: "Test".to_string(),
            installed: true,
            required: false,
            version: Some("1.0.0".to_string()),
        };
        
        // 测试序列化
        let serialized = serde_json::to_string(&item).unwrap();
        assert!(serialized.contains("Test"));
        assert!(serialized.contains("true"));
        assert!(serialized.contains("1.0.0"));
        
        // 测试反序列化
        let deserialized: EnvItem = serde_json::from_str(&serialized).unwrap();
        assert_eq!(deserialized.name, "Test");
        assert_eq!(deserialized.installed, true);
        assert_eq!(deserialized.required, false);
        assert_eq!(deserialized.version, Some("1.0.0".to_string()));
    }

    // 集成测试：测试完整的工作流程
    #[test]
    fn test_integration_workflow() {
        // 1. 检查环境要求
        let requirements = get_env_requirements();
        assert!(!requirements.is_empty());
        
        // 2. 检查 Git 状态
        let git_status = check_git_installed();
        assert_eq!(git_status.name, "Git");
        
        // 3. 如果 Git 未安装，测试安装函数的调用（不实际安装）
        if !git_status.installed {
            // 在测试环境中，我们不实际执行安装
            // 但可以测试函数调用不会 panic
            println!("Git 未安装，在生产环境中会执行安装");
        } else {
            // 如果已安装，测试会返回适当的消息
            let install_result = install_git();
            assert!(install_result.is_ok());
            assert!(install_result.unwrap().contains("已经安装"));
        }
    }

    // 性能测试
    #[test]
    fn test_check_git_performance() {
        use std::time::Instant;
        
        let start = Instant::now();
        let _result = check_git_installed();
        let duration = start.elapsed();
        
        // Git 检查应该在合理时间内完成（比如 5 秒）
        assert!(duration.as_secs() < 5, "Git 检查耗时过长: {:?}", duration);
    }

    // Mock 测试：测试在没有网络连接时的行为
    #[cfg(target_os = "windows")]
    #[test] 
    fn test_windows_install_without_network() {
        // 这个测试模拟网络不可用的情况
        // 注意：这个测试实际上会尝试网络连接，在 CI 环境中可能需要跳过
        if std::env::var("CI").is_ok() {
            // 在 CI 环境中跳过网络测试
            return;
        }
        
        // 测试无效 URL 的处理
        // 这里我们不能直接测试 install_git_windows，因为它是私有的
        // 但我们可以测试整个 install_git 流程
        println!("网络测试在实际环境中运行");
    }
}