import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import { deleteItemAsync, getItemAsync, setItemAsync } from "expo-secure-store";
import i18next from "i18next";
import numeral from "numeral";
import { Platform } from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

// 扩展 dayjs
dayjs.extend(relativeTime);

export const widthPercentageToDP = wp;
export const heightPercentageToDP = hp;

/**
 * 将设计稿中的像素值转换为响应式尺寸
 * @param px 设计稿中的像素值（基于375px宽度）
 * @returns number 响应式尺寸
 */
export const px2wp = (px: number): number => {
  return wp(`${(px / 375) * 100}%`);
};

/**
 * 将设计稿中的像素值转换为响应式尺寸
 * @param px 设计稿中的像素值（基于812px高度）
 * @returns number 响应式尺寸
 */
export const px2hp = (px: number): number => {
  return hp(`${(px / 812) * 100}%`);
};

// 加密密钥，建议使用环境变量存储
const CRYPTO_KEY = "KEu5INycJHjwSrNvgXijIQ=="; // 使用32字符的密钥
const IV = CryptoJS.enc.Utf8.parse("1234567890123456"); // 16字节的IV

/**
 * AES加密
 * @param text 要加密的文本
 * @returns string 加密后的文本
 */
export const encrypt = (text: string): string => {
  try {
    // 创建密钥
    const key = CryptoJS.enc.Utf8.parse(CRYPTO_KEY);

    // 加密
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // 返回base64编码的加密字符串
    return encrypted.toString();
  } catch (error) {
    console.error("加密失败:", error);
    return "";
  }
};

/**
 * AES解密
 * @param encryptedText 加密后的文本
 * @returns string 解密后的文本
 */
export const decrypt = (encryptedText: string): string => {
  try {
    // 创建密钥
    const key = CryptoJS.enc.Utf8.parse(CRYPTO_KEY);

    // 解密
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // 返回解密后的字符串
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("解密失败:", error);
    return "";
  }
};

/**
 * 生成随机密钥
 * @param length 密钥长度
 * @returns string 随机密钥
 */
export const generateRandomKey = (length: number = 32): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = chars.length;

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

/**
 * 生成随机IV
 * @returns string 16字节的随机IV
 */
export const generateRandomIV = (): string => {
  return generateRandomKey(16);
};

// 设置认证 token
export async function setLocalCache(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      await AsyncStorage.setItem(key, value);
    } else {
      await setItemAsync(key, value);
    }
  } catch (error) {
    // console.error("Failed to save auth token:", error);
  }
}

// 获取认证 token
export async function getLocalCache(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return await AsyncStorage.getItem(key);
    } else {
      return await getItemAsync(key);
    }
  } catch (error) {
    // console.error("Failed to get auth token:", error);
    return null;
  }
}

// 清除认证 token
export async function clearLocalCache(key: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem(key);
    } else {
      await deleteItemAsync(key);
    }
  } catch (error) {
    // console.error("Failed to clear auth token:", error);
  }
}

/**
 * 图片代理地址
 * @param url
 * @returns
 */
export const imgProxy = (url?: string) => {
  if (!url) return "";
  if (/http/.test(url)) return url;
  return !__DEV__
    ? Constants.expoConfig?.extra?.apiUrl.prod.imgHost + url
    : Constants.expoConfig?.extra?.apiUrl.dev.imgHost + url;
};

/**
 * 生成模糊哈希值
 * @param url 图片URL
 * @returns 模糊哈希值
 */
export const generateBlurhash = (): string => {
  return "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
};

/**
 * 格式化日期
 * @param date 日期对象或字符串或时间戳
 * @param format 格式化模板，默认为 YYYY.MM.DD
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date?: Date | string | number | null,
  format: string = "YYYY.MM.DD"
): string => {
  if (!date) return "";
  return dayjs(date).format(format);
};

/**
 * 格式化日期时间
 * @param date 日期对象或字符串或时间戳
 * @param format 格式化模板，默认为 YYYY.MM.DD HH:mm
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (
  date?: Date | string | number | null,
  format: string = "YYYY.MM.DD HH:mm"
): string => {
  if (!date) return "";
  return dayjs(date).format(format);
};

/**
 * 解析日期字符串
 * @param dateStr 日期字符串
 * @param format 日期字符串的格式，可选
 * @returns Date对象，如果解析失败则返回null
 */
export const parseDate = (dateStr: string, format?: string): Date | null => {
  const parsed = format ? dayjs(dateStr, format) : dayjs(dateStr);
  return parsed.isValid() ? parsed.toDate() : null;
};

/**
 * 获取相对时间
 * @param date 日期对象或字符串或时间戳
 * @returns 相对时间字符串，如"3分钟前"、"2小时前"等
 */
export const getRelativeTime = (
  date?: Date | string | number | null
): string => {
  if (!date) return "";
  return dayjs(date).fromNow();
};

/**
 * 获取缓存大小
 * @returns Promise<string> 格式化后的缓存大小，如 "1.5MB"
 */
export const getCacheSize = async (): Promise<string> => {
  try {
    if (Platform.OS === "web") {
      // Web平台暂不支持获取缓存大小
      return "0B";
    }

    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return "0B";

    // 递归获取目录大小
    const getDirSize = async (dirUri: string): Promise<number> => {
      const items = await FileSystem.readDirectoryAsync(dirUri);
      let size = 0;

      for (const item of items) {
        const uri = `${dirUri}${item}`;
        const info = await FileSystem.getInfoAsync(uri);

        if (info.exists) {
          if (info.isDirectory) {
            size += await getDirSize(uri + "/");
          } else {
            size += info.size || 0;
          }
        }
      }

      return size;
    };

    const totalSize = await getDirSize(cacheDir);

    // 格式化大小
    const units = ["B", "KB", "MB", "GB"];
    let size = totalSize;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)}${units[unitIndex]}`;
  } catch (error) {
    console.error("获取缓存大小失败:", error);
    return "0B";
  }
};

/**
 * 清理缓存
 * @returns Promise<void>
 */
export const clearCache = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "web") {
      // Web平台清理localStorage
      await AsyncStorage.clear();
      return true;
    }

    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return false;

    // 递归删除目录内容
    const clearDir = async (dirUri: string) => {
      const items = await FileSystem.readDirectoryAsync(dirUri);

      for (const item of items) {
        const uri = `${dirUri}${item}`;
        const info = await FileSystem.getInfoAsync(uri);

        if (info.exists) {
          if (info.isDirectory) {
            await clearDir(uri + "/");
            await FileSystem.deleteAsync(uri, { idempotent: true });
          } else {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          }
        }
      }
    };

    await clearDir(cacheDir);
    return true;
  } catch (error) {
    console.error("error", error);
    return false;
  }
};

/**
 * 格式化数字为千分位
 * @param number 要格式化的数字
 * @returns 格式化后的字符串，如 "1,234,567"
 */
export const formatNumber = (number?: number | null): string => {
  if (number == null) return "0";
  return numeral(number).format("0,0");
};

/**
 * 格式化数字为带小数点的千分位
 * @param number 要格式化的数字
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的字符串，如 "1,234,567.89"
 */
export const formatDecimal = (
  number?: number | null,
  decimals: number = 2
): string => {
  if (number == null) return "0.00";
  return numeral(number).format(`0,0.${"0".repeat(decimals)}`);
};

/**
 * 格式化数字为带单位的简写
 * @param number 要格式化的数字
 * @returns 格式化后的字符串，如 "1.2k+"、"1.5m+"
 */
export const formatCompact = (number?: number | null): string => {
  if (number == null) return "0";
  if (number < 1000) return String(number);
  const formatted = numeral(number).format("0.0a");
  return `${formatted}+`;
};

/**
 * 格式化金额
 * @param amount 金额
 * @param symbol 货币符号，默认为 "$"
 * @returns 格式化后的字符串，如 "$1,234.56"
 */
export const formatCurrency = (
  amount?: number | null,
  symbol: string = "$"
): string => {
  if (amount == null) return `${symbol}0.00`;
  return `${symbol}${numeral(amount / 100).format("0,0.00")}`;
};

/**
 * 格式化百分比
 * @param number 要格式化的数字
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的字符串，如 "12.34%"
 */
export const formatPercent = (
  number?: number | null,
  decimals: number = 2
): string => {
  if (number == null) return "0%";
  return numeral(number / 100).format(`0.${"0".repeat(decimals)}%`);
};

/**
 * 生成指定区间内的随机整数
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @returns 随机整数
 * @example
 * // 生成1到10之间的随机整数
 * const random = randomInt(1, 10);
 */
export const randomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 生成指定区间内的多个不重复随机整数
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 * @param count 需要生成的数量
 * @returns 不重复的随机整数数组
 * @example
 * // 生成1到10之间的3个不重复随机整数
 * const numbers = randomUniqueInts(1, 10, 3);
 */
export const randomUniqueInts = (
  min: number,
  max: number,
  count: number
): number[] => {
  min = Math.ceil(min);
  max = Math.floor(max);

  // 如果要生成的数量大于可能的范围，返回全部数字的随机排序
  if (count >= max - min + 1) {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i).sort(
      () => Math.random() - 0.5
    );
  }

  const result = new Set<number>();
  while (result.size < count) {
    result.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(result);
};

/**
 * 从数组中随机选择一个元素
 * @param array 源数组
 * @returns 随机选中的元素
 * @example
 * // 从数组中随机选择一个元素
 * const item = randomPick(['a', 'b', 'c']);
 */
export const randomPick = <T>(array: T[]): T => {
  if (array.length === 0) throw new Error("Array is empty");
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 从数组中随机选择多个不重复元素
 * @param array 源数组
 * @param count 需要选择的数量
 * @returns 随机选中的元素数组
 * @example
 * // 从数组中随机选择2个不重复元素
 * const items = randomPicks(['a', 'b', 'c'], 2);
 */
export const randomPicks = <T>(array: T[], count: number): T[] => {
  if (count > array.length) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * 格式化持续时间
 * @param seconds 秒数
 * @param format 格式化选项，默认为 'auto'
 * @returns 格式化后的持续时间字符串
 * @example
 * // 格式化为最适合的单位
 * formatDuration(5400) // 返回 "1.5 hours" (90分钟)
 * formatDuration(2700) // 返回 "45 minutes"
 * formatDuration(9000) // 返回 "2.5 hours" (150分钟)
 */
export const formatDuration = (
  seconds?: number | null,
  format: "auto" | "minutes" | "hours" = "auto"
): string => {
  if (seconds == null || seconds < 0) {
    return `0 ${i18next.t("common.time.minutes")}`;
  }

  // 转换秒为分钟
  const minutes = Math.round(seconds / 60);

  if (format === "minutes" || (format === "auto" && minutes < 60)) {
    return `${minutes} ${i18next.t("common.time.minutes")}`;
  }

  // 转换分钟为小时
  const hours = minutes / 60;
  return `${hours.toFixed(1)} ${i18next.t("common.time.hours")}`;
};

/**
 * 数字补零，在数字前方不足指定位数时补零
 * @param number 要格式化的数字
 * @param length 期望的总长度，默认为2
 * @returns 补零后的字符串
 * @example
 * // 补零到2位
 * padZero(5) // 返回 "05"
 * padZero(10) // 返回 "10"
 * // 补零到3位
 * padZero(5, 3) // 返回 "005"
 */
export const padZero = (
  number: number | string,
  length: number = 2
): string => {
  return String(number).padStart(length, "0");
};

export const getOptionLetter = (index: number): string => {
  if (index < 0 || index > 25) return "";
  return String.fromCharCode(65 + index); // 65 是 'A' 的 ASCII 码
};

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (Platform.OS === "web") {
      // 使用现代 Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // 降级方案：使用 document.execCommand
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // 防止滚动到底部
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand("copy");
        textArea.remove();
        return true;
      } catch (err) {
        console.error("复制失败:", err);
        textArea.remove();
        return false;
      }
    } else {
      await Clipboard.setStringAsync(text);
      return true;
    }
  } catch (error) {
    console.error("复制失败:", error);
    return false;
  }
};
