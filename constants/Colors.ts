/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

import { ColorGroup } from "../components/test/start/ColorChoice";

export const DEFAULT_COLOR_GROUPS: ColorGroup[] = [
  {
    colors: [
      "#FFFAE7",
      "#FEF8DE",
      "#FDF6D9",
      "#FCF6D2",
      "#FCF3CA",
      "#FDF2C4",
      "#FCF0BE",
      "#FBEFB5",
    ],
    label: "黄色系",
  },
  {
    colors: [
      "#FCF2E8",
      "#FCEFDF",
      "#FCEBD9",
      "#FAE8D2",
      "#FAE2C8",
      "#FAE0C5",
      "#F9DCBC",
      "#F9D9B3",
    ],
    label: "橙色系",
  },
  {
    colors: [
      "#FBE9E7",
      "#FAE2DE",
      "#F9DCD8",
      "#F8D5CF",
      "#F7CEC8",
      "#F5C8C2",
      "#F6C1BB",
      "#F5BAB2",
    ],
    label: "红色系",
  },
  {
    colors: [
      "#FBE6EF",
      "#FADEEA",
      "#F8D8E5",
      "#F6CFE1",
      "#F5C8DD",
      "#F6C2D8",
      "#F4BAD3",
      "#F3B3CE",
    ],
    label: "粉红系",
  },
  {
    colors: [
      "#FBE6F7",
      "#FADEF5",
      "#F8D7F2",
      "#F7CFF1",
      "#F6C8ED",
      "#F5C2ED",
      "#F4B9E7",
      "#F3B3E7",
    ],
    label: "紫红系",
  },
  {
    colors: [
      "#F5E6FD",
      "#F3DFFB",
      "#F1D7FC",
      "#F0CFFC",
      "#ECC7FB",
      "#E9C2FB",
      "#E7B9F9",
      "#E4B2FB",
    ],
    label: "紫色系",
  },
  {
    colors: [
      "#EFE5FD",
      "#EBDEFC",
      "#E7D7FC",
      "#E2CFFC",
      "#DEC7FB",
      "#D9C2FA",
      "#D5B8FA",
      "#D0B0F6",
    ],
    label: "深紫系",
  },
  {
    colors: [
      "#E8E6FC",
      "#E1DEFD",
      "#DBD7FC",
      "#D4CEFA",
      "#CDC6FA",
      "#C4BEFA",
      "#BEB7FA",
      "#B7AFFA",
    ],
    label: "蓝紫系",
  },
  {
    colors: [
      "#E7E8FD",
      "#DEDFFD",
      "#D7DAFD",
      "#D0D3FC",
      "#C7CEFC",
      "#BFC4FB",
      "#B9BFFB",
      "#B1B9FA",
    ],
    label: "浅蓝系",
  },
  {
    colors: [
      "#E7F1FD",
      "#E0EBFD",
      "#DAE9FE",
      "#D2E4FC",
      "#CBE0FD",
      "#C5DCFC",
      "#BED8FB",
      "#B6D3FB",
    ],
    label: "天蓝系",
  },
];

export const RADAR_COLOR = [
  "#8965E5",
  "#FF6692",
  "#12B282",
  "#FF52F3",
  "#00C3FF",
  "#5289FF",
  "#8DC222",
  "#FFC966",
];

export const GROWTH_PATH_COLOR = [
  "#90FF5D",
  "#39DD72",
  "#29DDED",
  "#2C8BFF",
  "#7550E5",
  "#FFCC5D",
  "#FE88EA",
  "#FAB46E",
  "#FF5DA8",
  "#B35DFF",
];
