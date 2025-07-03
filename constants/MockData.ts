import { Question } from "@/services/testServices";
import { TFunction } from "i18next";

// 测试页假数据
export const mockDataFn = (t: TFunction) => {
  return {
    header: {
      bg: require("@/assets/images/test/bg-1.png"),
      color: ["#8257E5", "#271A45"] as any,
    },
    testInfo: {
      questionCount: 60,
      estimatedTime: "30",
      source: "MBTI",
      tags: [
        t("test.tags.personalityAnalysis"),
        t("test.tags.psychologicalAssessment"),
        t("test.tags.selfAwareness"),
      ],
    },
    avatar: {
      image: require("@/assets/images/test/question.png"),
    },
    report: {
      chartData: {
        labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8"],
        data: [10, 15, 50, 15, 10, 20, 40, 20, 10],
      },
    },
    traits: [
      {
        icon: require("@/assets/images/test/trait1.png"),
        label: t("test.traits.innovativeThinking"),
        value: 85,
        color: "#8257E5",
        description: t("test.traits.innovativeThinkingDesc"),
      },
      {
        icon: require("@/assets/images/test/trait2.png"),
        label: t("test.traits.leadership"),
        value: 75,
        color: "#04D361",
        description: t("test.traits.leadershipDesc"),
      },
      {
        icon: require("@/assets/images/test/trait3.png"),
        label: t("test.traits.teamBuilder"),
        value: 90,
        color: "#FF963A",
        description: t("test.traits.teamBuilderDesc"),
      },
    ],
    dimensions: [
      {
        label: t("test.dimensions.leadership"),
        value: 85,
        color: "#AB8AFF",
        trend: "up" as any,
      },
      {
        label: t("test.dimensions.rolePerception"),
        value: 70,
        color: "#FFD76F",
        trend: "down" as any,
      },
      {
        label: t("test.dimensions.values"),
        value: 90,
        color: "#67C7FF",
        trend: "down" as any,
      },
      {
        label: t("test.dimensions.positiveness"),
        value: 95,
        color: "#00CEB6",
        trend: "up" as any,
      },
      {
        label: t("test.dimensions.emotionalManagement"),
        value: 45,
        color: "#FF8FAF",
        trend: "down" as any,
      },
    ],
    recommendations: {
      title: t("test.components.personalAdvice.title"),
      adviceItems: [
        { id: 1, text: t("test.components.personalAdvice.items.personal") },
        { id: 2, text: t("test.components.personalAdvice.items.career") },
        { id: 3, text: t("test.components.personalAdvice.items.relationship") },
      ],
    },
    radar: [
      {
        label: t("test.radar.logicalThinking"),
        value: 82.1,
        color: "#8965E5",
      },
      {
        label: t("test.radar.executionAbility"),
        value: 92.3,
        color: "#FF6692",
      },
      {
        label: t("test.radar.decisionMaking"),
        value: 80.5,
        color: "#12B282",
      },
      {
        label: t("test.radar.emotionalManagement"),
        value: 86.2,
        color: "#FF52F3",
      },
      {
        label: t("test.radar.learningAdaptability"),
        value: 88.4,
        color: "#00C3FF",
      },
      {
        label: t("test.radar.teamwork"),
        value: 79.6,
        color: "#5289FF",
      },
      {
        label: t("test.radar.communication"),
        value: 93.6,
        color: "#8DC222",
      },
      {
        label: t("test.radar.innovativeThinking"),
        value: 97.4,
        color: "#FFC966",
      },
    ],
    faqs: [
      {
        icon: require("@/assets/images/test/faq.png"),
        question: t("test.faqs.scientific.question"),
        answer: t("test.faqs.scientific.answer"),
      },
      {
        icon: require("@/assets/images/test/faq.png"),
        question: t("test.faqs.accuracy.question"),
        answer: t("test.faqs.accuracy.answer"),
      },
      {
        icon: require("@/assets/images/test/faq.png"),
        question: t("test.faqs.duration.question"),
        answer: t("test.faqs.duration.answer"),
      },
    ],
    badges: [
      {
        icon: require("@/assets/images/badges/creative-thinking.png"),
        title: t("test.badges.creativeThinking.title"),
        description: t("test.badges.creativeThinking.description"),
      },
      {
        icon: require("@/assets/images/badges/adaptability.png"),
        title: t("test.badges.adaptability.title"),
        description: t("test.badges.adaptability.description"),
      },
      {
        icon: require("@/assets/images/badges/leadership.png"),
        title: t("test.badges.leadership.title"),
        description: t("test.badges.leadership.description"),
      },
      {
        icon: require("@/assets/images/badges/team-builder.png"),
        title: t("test.badges.teamBuilder.title"),
        description: t("test.badges.teamBuilder.description"),
      },
      {
        icon: require("@/assets/images/badges/communicator.png"),
        title: t("test.badges.communicator.title"),
        description: t("test.badges.communicator.description"),
      },
      {
        icon: require("@/assets/images/badges/learner.png"),
        title: t("test.badges.learner.title"),
        description: t("test.badges.learner.description"),
      },
    ],
    textProgress: {
      title: t("test.textProgress.title"),
      subtitle: t("test.textProgress.subtitle"),
      items: [
        {
          text: t("test.textProgress.items.unique"),
          color: "#00A1FF",
        },
        {
          text: t("test.textProgress.items.understanding"),
          color: "#00CEB6",
        },
        {
          text: t("test.textProgress.items.traits"),
          color: "#FFB900",
        },
        {
          text: t("test.textProgress.items.reflection"),
          color: "#FF6692",
        },
        {
          text: t("test.textProgress.items.potential"),
          color: "#8965E5",
        },
      ],
    },
    growthPath: {
      currentStage: 3,
      stages: [
        {
          title: t("test.growthPath.selfAwareness.title"),
          color: "#90FF5D",
          stage: 1,
          description: t("test.growthPath.selfAwareness.description"),
        },
        {
          title: t("test.growthPath.skillDevelopment.title"),
          color: "#39DD72",
          stage: 2,
          description: t("test.growthPath.skillDevelopment.description"),
        },
        {
          title: t("test.growthPath.practicalApplication.title"),
          color: "#29DDED",
          stage: 3,
          description: t("test.growthPath.practicalApplication.description"),
        },
        {
          title: t("test.growthPath.optimization.title"),
          color: "#2C8BFF",
          stage: 4,
          description: t("test.growthPath.optimization.description"),
        },
        {
          title: t("test.growthPath.influence.title"),
          color: "#7550E5",
          stage: 5,
          description: t("test.growthPath.influence.description"),
        },
      ],
    },
    visualDashboard: {
      title: t("test.components.visualDashboard.title"),
      value: 50,
      level: t("test.components.visualDashboard.level"),
      completionRate: 82,
    },
  };
};

// 测试题假数据
export const mockQuestionsFn = (): Question[] => {
  return [
    {
      type: 7,
      content: "时间分配评估",
      id: 4,
      options: [
        { id: 10, content: "工作和学习", dimension: "W", score: 5 },
        { id: 20, content: "社交娱乐", dimension: "S", score: 4 },
        { id: 30, content: "个人爱好", dimension: "H", score: 3 },
        { id: 40, content: "休息放松", dimension: "R", score: 2 },
      ],
    },
    {
      type: 8,
      content: "色彩偏好测试",
      id: 9,
      options: [
        { id: 1, content: "热情红", dimension: "E", score: 5 },
        { id: 2, content: "平静蓝", dimension: "C", score: 4 },
        { id: 3, content: "自然绿", dimension: "N", score: 3 },
        { id: 4, content: "智慧蓝", dimension: "W", score: 5 },
        { id: 5, content: "阳光黄", dimension: "P", score: 4 },
        { id: 6, content: "梦幻紫", dimension: "D", score: 3 },
      ],
    },
    {
      type: 6,
      content: "Role Preference Assessment",
      id: 1,
      options: [
        { id: 1, content: "领导者", dimension: "L", score: 5 },
        { id: 2, content: "执行者", dimension: "E", score: 4 },
        { id: 3, content: "思考者", dimension: "T", score: 3 },
        { id: 4, content: "协调者", dimension: "C", score: 2 },
      ],
    },
    {
      type: 5,
      content: "情绪状态评估",
      id: 2,
      options: [
        { id: 1, content: "高兴", dimension: "P", score: 5 },
        { id: 2, content: "悲伤", dimension: "N", score: 2 },
        { id: 3, content: "愤怒", dimension: "N", score: 1 },
        { id: 4, content: "恐惧", dimension: "N", score: 1 },
        { id: 5, content: "惊讶", dimension: "N", score: 3 },
      ],
    },
    {
      type: 2,
      content: "兴趣爱好评估",
      id: 3,
      options: [
        { id: 1, content: "艺术与创作", dimension: "A", score: 5 },
        { id: 2, content: "科技与创新", dimension: "T", score: 5 },
        { id: 3, content: "运动与健康", dimension: "S", score: 5 },
        { id: 4, content: "阅读与写作", dimension: "L", score: 5 },
        { id: 5, content: "音乐与表演", dimension: "M", score: 5 },
      ],
      maxSelect: 3,
    },
    {
      type: 3,
      content: "工作动力评估",
      id: 5,
      options: [
        { id: 1, content: "非常积极", dimension: "M", score: 5 },
        { id: 2, content: "比较积极", dimension: "M", score: 4 },
        { id: 3, content: "一般", dimension: "M", score: 3 },
        { id: 4, content: "比较消极", dimension: "M", score: 2 },
        { id: 5, content: "非常消极", dimension: "M", score: 1 },
      ],
    },
    {
      type: 10,
      content: "情绪色彩测试",
      id: 6,
      options: [
        { id: 1, content: "热情红", dimension: "E", score: 5 },
        { id: 2, content: "平静蓝", dimension: "C", score: 4 },
        { id: 3, content: "自然绿", dimension: "N", score: 3 },
        { id: 4, content: "智慧蓝", dimension: "W", score: 5 },
        { id: 5, content: "阳光黄", dimension: "P", score: 4 },
        { id: 6, content: "梦幻紫", dimension: "D", score: 3 },
      ],
    },
    {
      type: 9,
      content: "图形偏好测试",
      id: 7,
      options: [
        { id: 1, content: "圆形组合", dimension: "C", score: 5 },
        { id: 2, content: "方形组合", dimension: "S", score: 4 },
        { id: 3, content: "三角形组合", dimension: "T", score: 3 },
        { id: 4, content: "菱形组合", dimension: "D", score: 2 },
      ],
    },
    {
      type: 1,
      content: "性格类型测试",
      id: 8,
      options: [
        { id: 1, content: "主动承担领导角色", dimension: "L", score: 5 },
        { id: 2, content: "积极参与讨论", dimension: "P", score: 4 },
        { id: 3, content: "默默支持团队", dimension: "S", score: 3 },
        { id: 4, content: "独立完成任务", dimension: "I", score: 2 },
      ],
    },

    {
      type: 4,
      content: "工作价值观评估",
      id: 10,
      options: [
        { id: 1, content: "成就感", dimension: "A", score: 5 },
        { id: 2, content: "工作稳定性", dimension: "S", score: 4 },
        { id: 3, content: "团队协作", dimension: "T", score: 3 },
        { id: 4, content: "创新机会", dimension: "I", score: 2 },
      ],
    },
  ];
};
