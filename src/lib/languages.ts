/**
 * 语言配置和工具函数
 */

export interface Language {
  code: string; // BCP 47 语言标签
  name: string;
  nativeName: string;
  flag: string; // 国旗代码
}

// 常用语言列表
export const COMMON_LANGUAGES: Language[] = [
  { code: "zh-Hans", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "cn" },
  { code: "zh-Hant", name: "Chinese (Traditional)", nativeName: "繁體中文", flag: "tw" },
  { code: "en-US", name: "English (US)", nativeName: "English (US)", flag: "us" },
  { code: "en-GB", name: "English (UK)", nativeName: "English (UK)", flag: "gb" },
  { code: "ja-JP", name: "Japanese", nativeName: "日本語", flag: "jp" },
  { code: "ko-KR", name: "Korean", nativeName: "한국어", flag: "kr" },
  { code: "fr-FR", name: "French", nativeName: "Français", flag: "fr" },
  { code: "de-DE", name: "German", nativeName: "Deutsch", flag: "de" },
  { code: "es-ES", name: "Spanish", nativeName: "Español", flag: "es" },
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Português (Brasil)", flag: "br" },
  { code: "ru-RU", name: "Russian", nativeName: "Русский", flag: "ru" },
  { code: "it-IT", name: "Italian", nativeName: "Italiano", flag: "it" },
  { code: "ar-SA", name: "Arabic", nativeName: "العربية", flag: "sa" },
  { code: "th-TH", name: "Thai", nativeName: "ไทย", flag: "th" },
  { code: "vi-VN", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "vn" },
  { code: "id-ID", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "id" },
  { code: "ms-MY", name: "Malay", nativeName: "Bahasa Melayu", flag: "my" },
  { code: "tr-TR", name: "Turkish", nativeName: "Türkçe", flag: "tr" },
  { code: "pl-PL", name: "Polish", nativeName: "Polski", flag: "pl" },
  { code: "nl-NL", name: "Dutch", nativeName: "Nederlands", flag: "nl" },
];

/**
 * 获取语言国旗图标路径
 */
export function getLanguageFlagUrl(flag: string): string {
  // Vite 会自动处理 public 目录的资源
  return `/flag/${flag}.svg`;
}

/**
 * 根据语言代码查找语言信息
 */
export function findLanguage(code: string): Language | undefined {
  return COMMON_LANGUAGES.find((lang) => lang.code === code);
}

