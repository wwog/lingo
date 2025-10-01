use serde::{Deserialize, Serialize};
use std::process::{Command, Stdio};
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader as AsyncBufReader};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnvItem {
    pub name: String,
    pub installed: bool,
    pub required: bool,
    pub version: Option<String>,
}

#[tauri::command]
pub fn check_git_installed() -> EnvItem {
    let output = Command::new("git").arg("--version").output();

    let (installed, version) = match &output {
        Ok(output) => {
            let success = output.status.success();
            let version = if success {
                let version_str = String::from_utf8_lossy(&output.stdout);
                // 典型输出: "git version 2.x.x"
                version_str.split_whitespace().nth(2).map(|v| v.to_string())
            } else {
                None
            };
            (success, version)
        }
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
pub async fn install_git_with_progress(app: AppHandle) -> Result<String, String> {
    emit_install_output(&app, "Git 未安装，开始安装流程...");

    #[cfg(target_os = "windows")]
    {
        // Windows 使用直接下载安装
        match install_git_windows_with_progress(&app).await {
            Ok(message) => {
                emit_install_output(&app, &message);
                // 再次检查 Git 是否安装成功
                let final_check = check_git_installed();
                if final_check.installed {
                    let success_msg = format!(
                        "Git 安装成功！版本: {}",
                        final_check.version.unwrap_or("未知".to_string())
                    );
                    emit_install_output(&app, &success_msg);
                    Ok(success_msg)
                } else {
                    let error_msg =
                        "Git 安装完成，但检测仍未安装。可能需要重启应用或刷新环境变量。"
                            .to_string();
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

// Windows 带进度的安装函数
#[cfg(target_os = "windows")]
async fn install_git_windows_with_progress(app: &AppHandle) -> Result<String, String> {
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

    // 保存到桌面
    let temp_dir = std::env::temp_dir();
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    let installer_path = temp_dir.join(format!("git-installer-{}.exe", timestamp));
    emit_install_output(app, &format!("保存路径: {}", installer_path.display()));
    emit_install_output(app, &format!("正在从 {} 下载 Git 安装包...", download_url));

    // 下载安装包
    let response = reqwest::get(download_url)
        .await
        .map_err(|e| format!("下载失败: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("下载失败，HTTP 状态码: {}", response.status()));
    }

    // 获取文件大小用于进度显示
    let total_size = response.content_length().unwrap_or(0);
    if total_size > 0 {
        emit_install_output(
            app,
            &format!("开始下载，文件大小: {} MB", total_size / 1024 / 1024),
        );
    }

    // 分块下载并显示进度
    let mut downloaded = 0u64;
    let mut content = Vec::new();
    let mut stream = response.bytes_stream();
    let mut last_progress = 0u64;

    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("下载数据失败: {}", e))?;
        content.extend_from_slice(&chunk);
        downloaded += chunk.len() as u64;

        if total_size > 0 {
            let progress = (downloaded * 100) / total_size;
            // 每5%显示一次进度，避免过于频繁
            if progress >= last_progress + 5 || progress == 100 {
                emit_install_output(
                    app,
                    &format!(
                        "下载进度: {}% ({}/{} MB)",
                        progress,
                        downloaded / 1024 / 1024,
                        total_size / 1024 / 1024
                    ),
                );
                last_progress = progress;
            }
        }
    }

    emit_install_output(
        app,
        &format!("下载完成，文件大小: {} MB", content.len() / 1024 / 1024),
    );

    // 保存到临时文件 - 使用作用域确保文件句柄正确释放
    {
        let mut file = tokio::fs::File::create(&installer_path)
            .await
            .map_err(|e| format!("创建临时文件失败: {}", e))?;

        emit_install_output(app, "开始写入文件到磁盘...");
        file.write_all(&content)
            .await
            .map_err(|e| format!("写入安装包失败: {}", e))?;

        emit_install_output(app, "强制刷新缓冲区到磁盘...");
        file.flush()
            .await
            .map_err(|e| format!("刷新文件到磁盘失败: {}", e))?;

        emit_install_output(app, "文件写入完成，正在关闭文件句柄...");

        // 文件句柄在这里自动 drop
    }

    emit_install_output(app, "文件句柄已释放，文件操作完全完成");
    emit_install_output(app, "下载完成，开始安装...");

    // 检查文件是否存在且可访问
    if !installer_path.exists() {
        return Err("安装包文件不存在".to_string());
    }

    // 检查文件权限和状态
    if let Ok(metadata) = std::fs::metadata(&installer_path) {
        emit_install_output(app, &format!("文件大小验证: {} bytes", metadata.len()));
        emit_install_output(
            app,
            &format!("文件只读状态: {}", metadata.permissions().readonly()),
        );
        emit_install_output(app, &format!("预期大小: {} bytes", content.len()));

        if metadata.len() != content.len() as u64 {
            return Err("文件大小不匹配，可能写入不完整".to_string());
        }
    } else {
        return Err("无法读取文件元数据".to_string());
    }

    emit_install_output(
        app,
        &format!("准备执行安装程序: {}", installer_path.display()),
    );

    // 再次短暂等待，确保所有系统操作完成
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    // 执行静默安装
    let mut child = tokio::process::Command::new(&installer_path)
        .args(&[
            "/VERYSILENT",                                                   // 静默安装
            "/NORESTART",                                                    // 不重启
            "/NOCANCEL",                                                     // 不允许取消
            "/SP-",                                                          // 不显示启动画面
            "/CLOSEAPPLICATIONS",                                            // 关闭相关应用
            "/RESTARTAPPLICATIONS",                                          // 重启相关应用
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

    let output = child
        .wait()
        .await
        .map_err(|e| format!("等待安装进程完成失败: {}", e))?;

    println!("清理临时文件");
    // 清理临时文件
    let _ = tokio::fs::remove_file(&installer_path).await;

    println!("清理临时文件完成");

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
            emit_install_output(&app_clone, &format!("warn: {}", line));
        }
    });

    emit_install_output(app, "正在安装 Git，请稍候...");

    let output = child
        .wait()
        .await
        .map_err(|e| format!("等待安装进程完成失败: {}", e))?;

    if output.success() {
        let final_check = check_git_installed();
        if final_check.installed {
            Ok(format!(
                "Git 安装成功！版本: {}",
                final_check.version.unwrap_or("未知".to_string())
            ))
        } else {
            Err("Git 安装命令执行成功，但检测仍未安装".to_string())
        }
    } else {
        Err(format!(
            "Git 安装失败，退出码: {}",
            output.code().unwrap_or(-1)
        ))
    }
}

// 根据操作系统平台获取对应的 Git 安装命令
#[cfg(not(target_os = "windows"))]
fn get_git_install_command() -> Result<(String, Vec<String>), String> {
    #[cfg(target_os = "macos")]
    {
        // macOS 使用 Homebrew
        if Command::new("brew").arg("--version").output().is_ok() {
            Ok((
                "brew".to_string(),
                vec!["install".to_string(), "git".to_string()],
            ))
        } else {
            Err("未找到 Homebrew。请先安装 Homebrew 或手动安装 Git。".to_string())
        }
    }

    #[cfg(target_os = "linux")]
    {
        // Linux 尝试不同的包管理器
        if Command::new("apt").arg("--version").output().is_ok() {
            // Debian/Ubuntu - 先更新包列表，然后安装 git
            Ok((
                "sh".to_string(),
                vec![
                    "-c".to_string(),
                    "sudo apt update && sudo apt install -y git".to_string(),
                ],
            ))
        } else if Command::new("yum").arg("--version").output().is_ok() {
            // CentOS/RHEL
            Ok((
                "sudo".to_string(),
                vec![
                    "yum".to_string(),
                    "install".to_string(),
                    "-y".to_string(),
                    "git".to_string(),
                ],
            ))
        } else if Command::new("dnf").arg("--version").output().is_ok() {
            // Fedora
            Ok((
                "sudo".to_string(),
                vec![
                    "dnf".to_string(),
                    "install".to_string(),
                    "-y".to_string(),
                    "git".to_string(),
                ],
            ))
        } else if Command::new("pacman").arg("--version").output().is_ok() {
            // Arch Linux
            Ok((
                "sudo".to_string(),
                vec![
                    "pacman".to_string(),
                    "-S".to_string(),
                    "--noconfirm".to_string(),
                    "git".to_string(),
                ],
            ))
        } else {
            Err("未找到支持的包管理器 (apt, yum, dnf, pacman)。请手动安装 Git。".to_string())
        }
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("不支持的操作系统".to_string())
    }
}
