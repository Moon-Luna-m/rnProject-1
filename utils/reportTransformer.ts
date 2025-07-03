import { GROWTH_PATH_COLOR, RADAR_COLOR } from "@/constants/Colors";
import { imgProxy } from "./common";

// 定义各种组件的数据接口
interface MatchingResultData {
  result_type: string;
  result_value: string;
  result_title: string;
  result_desc: string;
  result_image: string;
}

interface KeywordTagData {
  tags: Array<{
    text: string;
    icon: string;
  }>;
}

interface RadarChartData {
  title: string;
  dimensions: Array<{
    name: string;
    value: number;
    desc: string;
  }>;
  max_value: number;
}

interface VisualMeterData {
  title: string;
  meters: Array<{
    name: string;
    value: number;
    max_value: number;
    unit: string;
    level: string;
  }>;
}

interface TextProgressData {
  title: string;
  paragraphs: Array<{
    content: string;
    highlight: boolean;
  }>;
}

interface QuoteImageData extends Array<{
  quote: string;
  author: string;
}> {}

interface StoryCardData {
  title: string;
  character: string;
  avatar: string;
  dialogues: Array<{
    speaker: string;
    content: string;
    emotion: string;
  }>;
}

interface RecommendationData {
  title: string;
  layout: string;
  recommendations: string[];
}

interface GrowthPathData {
  title: string;
  stages: Array<{
    name: string;
    description: string;
    status: string;
    tips: string[];
  }>;
}

interface BadgeData {
  badges: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
}

interface MultiDimensionalData {
  title: string;
  dimensions: Array<{
    name: string;
    value: number;
    desc: string;
    trend: string;
  }>;
  max_value: number;
}

// 组件数据转换器
export const transformers = {
  // 匹配结果数据转换
  transformMatchingResultData: (data: MatchingResultData) => {
    return {
      type: data.result_type,
      value: data.result_value,
      title: data.result_title,
      description: data.result_desc,
      imageUrl: imgProxy(data.result_image),
    };
  },

  // 关键词标签数据转换
  transformKeywordTagData: (data: KeywordTagData) => {
    return {
      tags: data.tags.map((tag) => ({
        icon: imgProxy(tag.icon),
        label: tag.text,
      })),
    };
  },

  // 引用图片数据转换
  transformQuoteImageData: (data: QuoteImageData) => {
    return {
      list: data.map((item, index) => {
        return {
          id: index,
          text: item.quote,
          author: item.author,
        };
      }),
    };
  },

  // 故事卡片数据转换
  transformStoryCardData: (data: StoryCardData) => {
    return {
      title: data.title,
      character: data.character,
      avatarUrl: imgProxy(data.avatar),
      dialogues: data.dialogues.map((dialogue) => ({
        speaker: dialogue.speaker,
        content: dialogue.content,
        emotion: dialogue.emotion,
      })),
    };
  },

  // 推荐建议数据转换
  transformRecommendationData: (data: RecommendationData) => {
    return {
      title: data.title,
      layout: data.layout,
      suggestions: data.recommendations.map((rec, index) => ({
        id: index + 1,
        text: rec,
      })),
    };
  },

  // 多维度数据转换
  transformMultiDimensionalData: (data: MultiDimensionalData) => {
    return {
      title: data.title,
      dimensions: data.dimensions.map((dim, index) => ({
        label: dim.name,
        value: dim.value,
        description: dim.desc,
        maxValue: data.max_value,
        color: RADAR_COLOR[index % RADAR_COLOR.length],
        trend: dim.trend,
      })),
    };
  },

  // 雷达图数据转换
  transformRadarData: (data: RadarChartData) => {
    return {
      title: data.title,
      dimensions: data.dimensions.map((dim, index) => ({
        label: dim.name,
        value: dim.value,
        description: dim.desc,
        maxValue: data.max_value,
        color: RADAR_COLOR[index % RADAR_COLOR.length],
      })),
    };
  },

  // 徽章数据转换
  transformBadgeData: (data: BadgeData) => {
    return {
      badges: data.badges.map((badge) => ({
        title: badge.name,
        description: badge.description,
        icon: badge.icon,
      })),
    };
  },

  // 成长路径数据转换
  transformGrowthPathData: (data: GrowthPathData) => {
    return {
      title: data.title,
      currentStage:
        data.stages.findIndex((stage) => stage.status === "current") + 1,
      stages: data.stages.map((stage, index) => ({
        title: stage.name,
        description: stage.description,
        status: stage.status,
        tips: stage.tips,
        stage: index + 1,
        color: GROWTH_PATH_COLOR[index % GROWTH_PATH_COLOR.length],
      })),
    };
  },

  // 视觉仪表盘数据转换
  transformVisualDashboardData: (data: VisualMeterData) => {
    return {
      title: data.title,
      meters: data.meters.map((meter) => ({
        name: meter.name,
        value: meter.value,
        maxValue: meter.max_value,
        unit: meter.unit,
        level: meter.level,
      })),
    };
  },

  // 文本进度数据转换
  transformTextProgressData: (data: TextProgressData) => {
    return {
      title: data.title,
      sections: data.paragraphs.map((para, index) => ({
        id: index + 1,
        text: para.content,
        isHighlighted: para.highlight,
        color: RADAR_COLOR[index % RADAR_COLOR.length],
      })),
    };
  },
};

function getTagColor(tag: string): string {
  const colorMap: Record<string, string> = {
    Creative: "#FF6B6B",
    Curious: "#4ECDC4",
    Adaptable: "#45B7D1",
    // 添加更多颜色映射
  };
  return colorMap[tag] || "#96CEB4";
}

// 更新主转换函数
export function transformTestReport(reportData: any) {
  const { components, test_id, test_name, has_access } = reportData;

  const transformedComponents = components
    .map((component: any) => {
      switch (component.type) {
        case "MatchingResultBlock":
          return {
            type: "MatchingResultBlock",
            data: transformers.transformMatchingResultData(component.data),
          };
        case "RadarChartBlock":
          return {
            type: "RadarChartBlock",
            data: transformers.transformRadarData(component.data),
          };
        case "VisualMeterBlock":
          return {
            type: "VisualMeterBlock",
            data: transformers.transformVisualDashboardData(component.data),
          };
        case "TextProgressBlock":
          return {
            type: "TextProgressBlock",
            data: transformers.transformTextProgressData(component.data),
          };
        case "StoryCardBlock":
          return {
            type: "StoryCardBlock",
            data: transformers.transformStoryCardData(component.data),
          };
        case "RecommendationBox":
          return {
            type: "RecommendationBox",
            data: transformers.transformRecommendationData(component.data),
          };
        case "GrowthPathBlock":
          return {
            type: "GrowthPathBlock",
            data: transformers.transformGrowthPathData(component.data),
          };
        case "MultiDimensionalBlock":
          return {
            type: "MultiDimensionalBlock",
            data: transformers.transformMultiDimensionalData(component.data),
          };
        case "BadgeBlock":
          return {
            type: "BadgeBlock",
            data: transformers.transformBadgeData(component.data),
          };
        case "KeywordTagBlock":
          return {
            type: "KeywordTagBlock",
            data: transformers.transformKeywordTagData(component.data),
          };
        case "QuoteImageBlock":
          return {
            type: "QuoteImageBlock",
            data: transformers.transformQuoteImageData(component.data),
          };
        default:
          return null;
      }
    })
    .filter(Boolean);
  return {
    testId: test_id,
    testName: test_name,
    hasAccess: has_access,
    components: transformedComponents,
  };
}

// 使用示例
export function getTransformedReport(reportData: any) {
  return transformTestReport(reportData);
}

export const typeList = [
  {
    id: 1,
    key: "personality",
  },
  {
    id: 2,
    key: "emotion",
  },
  {
    id: 3,
    key: "relationship",
  },
  {
    id: 4,
    key: "career",
  },
  {
    id: 5,
    key: "youth",
  },
  {
    id: 6,
    key: "fun",
  },
] as const;

export type TestType = (typeof typeList)[number]["key"];

export function getTestTypeKey(type_id: number): TestType | undefined {
  return typeList.find((item) => item.id === type_id)?.key;
}

export function getTestTypeId(type_key: TestType): number | undefined {
  return typeList.find((item) => item.key === type_key)?.id;
}

// 使用示例：
// import { useTranslation } from "react-i18next";
// const { t } = useTranslation();
// const typeName = t(`test.types.${typeKey}.name`);
// const typeDescription = t(`test.types.${typeKey}.description`);
