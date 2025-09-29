// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // 始终通过库的 run 方法启动，以确保命令已注册
    lingo_lib::run()
}
