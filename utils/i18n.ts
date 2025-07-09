import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager, ImageSourcePropType } from "react-native";

// 导入翻译资源
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/pt-br";
import "dayjs/locale/zh";
import en from "../locales/en.json";
import ptBR from "../locales/pt-BR.json";
import zh from "../locales/zh.json";
import { clearLocalCache, getLocalCache, setLocalCache } from "./common";

const LANGUAGE_KEY = "language";

// 定义语言配置类型
type LanguageConfig = {
  label: string;
  value: string;
  isRTL: boolean;
  flag: ImageSourcePropType;
  code: string;
};

type Languages = {
  [key: string]: LanguageConfig;
};

// 支持的语言列表
export const LANGUAGES: Languages = {
  en: {
    label: "English",
    value: "en",
    isRTL: false,
    flag: require("@/assets/images/flags/en.png"),
    code: "en-US",
  },
  zh: {
    label: "简体中文",
    value: "zh",
    isRTL: false,
    flag: require("@/assets/images/flags/zh.png"),
    code: "zh-CN",
  },
  "pt-BR": {
    label: "Português (BR)",
    value: "pt-BR",
    isRTL: false,
    flag: require("@/assets/images/flags/pt-BR.png"),
    code: "pt-BR",
  },
};

// 检查语言是否在支持列表中
const isLanguageSupported = (language: string): boolean => {
  return !!LANGUAGES[language];
};

// 获取设备默认语言
const getDeviceLanguage = () => {
  const locales = Localization.getLocales();

  if (locales && locales.length > 0) {
    const locale = locales[0];
    const fullLanguageCode = locale.languageCode + (locale.regionCode ? `-${locale.regionCode}` : '');
    
    // 首先检查完整的语言代码（如 pt-BR）
    if (LANGUAGES[fullLanguageCode]) {
      return fullLanguageCode;
    }
    
    // 如果完整代码不存在，则检查主语言代码（如 pt）
    const primaryLanguage = locale.languageCode;
    if (LANGUAGES[primaryLanguage]) {
      return primaryLanguage;
    }
  }

  // 如果无法获取语言设置或不支持该语言，返回默认语言
  return "en";
};

// 获取存储的语言设置
export const getStoredLanguage = async () => {
  try {
    const language = await getLocalCache(LANGUAGE_KEY);

    // 如果有存储的语言且在支持列表中，则使用该语言
    if (language && isLanguageSupported(language)) {
      return language;
    }

    // 如果存储的语言不在支持列表中，清除缓存
    if (language) {
      await clearLocalCache(LANGUAGE_KEY);
    }

    // 使用系统语言
    const systemLanguage = getDeviceLanguage();

    // 将系统语言保存到 AsyncStorage
    await setLocalCache(LANGUAGE_KEY, systemLanguage);
    return systemLanguage;
  } catch (error) {
    // console.error("Error reading language from storage:", error);
    return getDeviceLanguage();
  }
};

// 设置语言
export const setLanguage = async (language: string) => {
  try {
    // 检查语言是否支持
    if (!isLanguageSupported(language)) {
      // console.warn(`Language ${language} is not supported, falling back to system language`);
      const systemLanguage = getDeviceLanguage();
      language = systemLanguage;
    }

    await setLocalCache(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);

    // 设置文字方向
    const isRTL = LANGUAGES[language]?.isRTL || false;
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    dayjs.locale(language);
    return true;
  } catch (error) {
    // console.error("Error setting language:", error);
    return false;
  }
};

// 初始化 i18n
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    "pt-BR": { translation: ptBR }
  },
  fallbackLng: "pt-BR",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// 设置初始语言
getStoredLanguage().then((language) => {
  setLanguage(language);
});

export default i18n;
