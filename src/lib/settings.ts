/**
 * 应用程序设置管理工具
 */

const DEFAULT_FOLDER_KEY = "lingo-default-folder";

/**
 * 获取默认项目文件夹路径
 * @returns 默认文件夹路径，如果未设置则返回 null
 */
export function getDefaultFolder(): string | null {
  return localStorage.getItem(DEFAULT_FOLDER_KEY);
}

/**
 * 设置默认项目文件夹路径
 * @param path 文件夹路径
 */
export function setDefaultFolder(path: string): void {
  if (path) {
    localStorage.setItem(DEFAULT_FOLDER_KEY, path);
  } else {
    localStorage.removeItem(DEFAULT_FOLDER_KEY);
  }
}

/**
 * 清除默认项目文件夹设置
 */
export function clearDefaultFolder(): void {
  localStorage.removeItem(DEFAULT_FOLDER_KEY);
}


