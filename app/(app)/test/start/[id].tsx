import NotificationToast from "@/components/NotificationToast";
import { ColorChoice } from "@/components/test/start/ColorChoice";
import { EmotionChoice } from "@/components/test/start/EmotionChoice";
import { ExitTestModal } from "@/components/test/start/ExitTestModal";
import { ImageTextChoice } from "@/components/test/start/ImageTextChoice";
import { ImageTextChoice2 } from "@/components/test/start/ImageTextChoice2";
import { PercentageSlider } from "@/components/test/start/PercentageSlider";
import { SingleChoice } from "@/components/test/start/SingleChoice";
import { SingleEmotionChoice } from "@/components/test/start/SingleEmotionChoice";
import { SliderChoice } from "@/components/test/start/SliderChoice";
import { SortChoice } from "@/components/test/start/SortChoice";
import { DEFAULT_COLOR_GROUPS } from "@/constants/Colors";
import { mockQuestionsFn } from "@/constants/MockData";
import { Option, Question, testService } from "@/services/testServices";
import { getLocalCache, imgProxy, padZero } from "@/utils/common";
import { createFontStyle } from "@/utils/typography";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 更新模拟题目数据
const mockQuestions = mockQuestionsFn();

interface TestAnswer {
  question_id: number;
  option_ids: number[];
  score?: number[];
}

interface TestSubmission {
  user_test_id: number;
  answers: TestAnswer[];
}

// 添加用户测试进度接口
interface SavedTestProgress {
  user_test_id: number;
  answers: {
    question_id: number;
    option_ids: number[];
  }[];
}

interface StartTestResponse {
  user_test_id: number;
  progress?: SavedTestProgress;
}

// 组件选项接口
interface ComponentOption {
  key: string;
  text: string;
}

interface SortComponentOption {
  id: string;
  text: string;
}

interface PercentageComponentOption {
  id: string;
  title: string;
}

interface ImageTextComponentOption {
  key: string;
  text: string;
  imageUrl: string;
}

interface ImageText2ComponentOption {
  key: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

// 转换选项格式的辅助函数
const mapOptionsToComponentFormat = (options: Option[]): ComponentOption[] => {
  return options.map((opt) => ({
    key: String(opt.id),
    text: opt.content,
  }));
};

const mapOptionsToSortFormat = (options: Option[]): SortComponentOption[] => {
  return options.map((opt) => ({
    id: String(opt.id),
    text: opt.content,
  }));
};

const mapOptionsToPercentageFormat = (
  options: Option[]
): PercentageComponentOption[] => {
  return options.map((opt) => ({
    id: String(opt.id),
    title: opt.content,
  }));
};

const mapOptionsToImageTextFormat = (
  options: Option[]
): ImageTextComponentOption[] => {
  return options.map((opt, index) => ({
    key: String(opt.id),
    text: opt.content,
    imageUrl: imgProxy(opt.image),
  }));
};

const mapOptionsToImageText2Format = (
  options: Option[]
): ImageText2ComponentOption[] => {
  return options.map((opt, index) => ({
    key: String(opt.id),
    title: opt.content,
    subtitle: opt.dimension,
    imageUrl: imgProxy(opt.image),
  }));
};

export default function StartTest() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{
    [questionId: string]: {
      type: number;
      option_ids: number[];
      question_id: number;
    };
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const [showExitModal, setShowExitModal] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testId, setTestId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastInfo, setToastInfo] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info" | "loading";
    duration: number | null;
    onDismiss: () => void;
  }>();

  // 转换服务器答案格式为本地状态格式
  const convertSubmissionToAnswers = (
    submission: TestSubmission,
    questions: Question[]
  ) => {
    const newAnswers: {
      [questionId: string]: {
        type: number;
        option_ids: number[];
        question_id: number;
      };
    } = {};

    let maxQuestionIndex = 0;

    submission.answers.forEach((answer) => {
      // 找到对应的问题以获取type
      const question = questions.find((q) => q.id === answer.question_id);
      if (question) {
        // 使用问题的索引作为key
        const questionIndex = questions.findIndex(
          (q) => q.id === answer.question_id
        );

        // 更新最大问题索引
        maxQuestionIndex = Math.max(maxQuestionIndex, questionIndex);

        // 如果是type 7且有score字段，使用score作为option_ids
        if ([7, 3].includes(question.type) && answer.score) {
          newAnswers[`question_${questionIndex}`] = {
            type: question.type,
            option_ids: answer.score,
            question_id: answer.question_id,
          };
        } else {
          newAnswers[`question_${questionIndex}`] = {
            type: question.type,
            option_ids: answer.option_ids,
            question_id: answer.question_id,
          };
        }
      }
    });

    // 更新当前问题索引
    setCurrentQuestion(maxQuestionIndex);

    return newAnswers;
  };

  // 从服务器加载测试进度
  useEffect(() => {
    const loadTestProgress = async () => {
      try {
        setIsLoading(true);
        const userTestWay = await getLocalCache("user_test_way");
        const userTestId = await getLocalCache("user_test_id");
        const [res1, res2, res3] = await Promise.all([
          userTestWay !== "user"
            ? await testService.startTest({ test_id: Number(params.id) })
            : {
                code: 200,
                data: {
                  user_test_id: Number(userTestId),
                },
              },
          await testService.getTestList({
            id: Number(userTestWay === "user" ? userTestId : params.id),
          }),
          // TODO: 从服务器获取测试进度
          userTestWay === "user"
            ? await testService.getUserTestDetail({ id: Number(params.id) })
            : null,
        ]);
        if (res1.code === 200) {
          setTestId(res1.data.user_test_id);
        } else {
          return router.replace("/");
        }
        if (res2.code === 200) {
          // setQuestions(res2.data.questions as Question[]);
          // if (res3) {
          //   setAnswers(
          //     convertSubmissionToAnswers(
          //       {
          //         user_test_id: res1.data.user_test_id,
          //         answers: res3.data.answers,
          //       },
          //       res2.data.questions as Question[]
          //     )
          //   );
          // }
          setQuestions(mockQuestions);
          // TODO: 如果有已保存的进度，转换格式并设置
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading test progress:", error);
        setIsLoading(false);
      }
    };

    loadTestProgress();
  }, [params.id]);

  // 格式化答案为提交格式
  const formatAnswersForSubmission = (): TestSubmission => {
    return {
      user_test_id: testId!,
      answers: Object.entries(answers).map(([questionId, answer]) => {
        // 对于type 7，添加score字段
        if ([7, 3].includes(answer.type)) {
          return {
            question_id: answer.question_id,
            option_ids: questions[
              parseInt(questionId.split("_")[1])
            ].options.map((opt) => opt.id),
            score: answer.option_ids,
          };
        }
        // 其他类型保持不变
        return {
          question_id: answer.question_id,
          option_ids: answer.option_ids,
        };
      }),
    };
  };

  // 更新答案的辅助函数
  const updateAnswer = (
    type: number,
    questionId: string,
    optionIds: number[],
    question_id: number
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        type,
        option_ids: optionIds,
        question_id,
      },
    }));
  };
  const handleNextQuestion = async () => {
    if (!getCurrentAnswer()) return;
    // 移动到下一题
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };
  const handleSubmit = async () => {
    const data = formatAnswersForSubmission();
    setIsSubmitting(true);
    const res = await testService.submitTestAnswer(data);
    setIsSubmitting(false);
    if (res.code === 200) {
      router.replace(`/test/result/${Number(params.id)}`);
    }
  };
  const handleExitSave = async () => {
    const saved = await saveProgress();
    if (saved) {
      handleExitConfirm();
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#19DBF2" />
      </View>
    );
  }

  const renderProgressTitle = () => {
    return (
      <>
        <View style={styles.testTitleContainer}>
          <Text style={styles.progressText}>{t("test.progress")}</Text>
          <View style={styles.testTitleTextContainer}>
            <Text
              style={[styles.testTitleText, { color: "#0C0A09", fontSize: 20 }]}
            >
              {padZero(currentQuestion + 1)}
            </Text>
            <Text style={styles.testTitleText}>/</Text>
            <Text style={styles.testTitleText}>
              {padZero(questions.length)}
            </Text>
          </View>
        </View>
        {renderProgressBar()}
      </>
    );
  };

  const renderQuestion = () => {
    const currentQuestionData = questions[currentQuestion % questions.length];
    const questionId = `question_${currentQuestion}`;
    const currentAnswer = answers[questionId]?.option_ids || [];

    if (currentQuestionData.type === 1) {
      return (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderProgressTitle()}
          <SingleChoice
            question={currentQuestionData.content}
            options={mapOptionsToComponentFormat(currentQuestionData.options)}
            selectedOption={currentAnswer[0]?.toString()}
            onSelect={(value) => {
              const selectedOption = currentQuestionData.options.find(
                (opt) => String(opt.id) === value
              );
              if (selectedOption) {
                updateAnswer(
                  1,
                  questionId,
                  [selectedOption.id],
                  currentQuestionData.id
                );
              }
            }}
            multiple={false}
          />
          <View style={styles.bottomSpace} />
        </ScrollView>
      );
    } else if (currentQuestionData.type === 2) {
      return (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderProgressTitle()}
          <SingleChoice
            question={currentQuestionData.content}
            options={mapOptionsToComponentFormat(currentQuestionData.options)}
            selectedOptions={currentAnswer.map(String)}
            onSelect={(value) => {
              const selectedOption = currentQuestionData.options.find(
                (opt) => String(opt.id) === value
              );
              if (selectedOption) {
                const newSelected = currentAnswer.includes(selectedOption.id)
                  ? currentAnswer.filter((v) => v !== selectedOption.id)
                  : [...currentAnswer, selectedOption.id];
                updateAnswer(
                  2,
                  questionId,
                  newSelected,
                  currentQuestionData.id
                );
              }
            }}
            multiple={true}
            maxSelect={currentQuestionData.maxSelect}
          />
          <View style={styles.bottomSpace} />
        </ScrollView>
      );
    } else if (currentQuestionData.type === 7) {
      return (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderProgressTitle()}
          <View style={{ paddingHorizontal: 16 }}>
            <View style={styles.answerContainer}>
              <PercentageSlider
                question={currentQuestionData.content}
                description={t("test.answerTips.tips3")}
                options={mapOptionsToPercentageFormat(
                  currentQuestionData.options
                )}
                values={Object.fromEntries(
                  currentAnswer.map((id, index) => [
                    currentQuestionData.options[index].id,
                    id,
                  ])
                )}
                onValuesChange={(values) => {
                  const optionIds = Object.values(values).map((v) =>
                    Math.round(v)
                  );
                  updateAnswer(
                    7,
                    questionId,
                    optionIds,
                    currentQuestionData.id
                  );
                }}
              />
            </View>
          </View>
          <View style={styles.bottomSpace} />
        </ScrollView>
      );
    } else if (currentQuestionData.type === 6) {
      return (
        <>
          {renderProgressTitle()}
          <EmotionChoice
            question={currentQuestionData.content}
            description=""
            options={currentQuestionData.options.map((opt) => ({
              id: String(opt.id),
              content: opt.content,
            }))}
            selectedEmotion={currentAnswer[0]?.toString()}
            onSelect={(value) => {
              const selectedOption = currentQuestionData.options.find(
                (opt) => String(opt.id) === value
              );
              if (selectedOption) {
                updateAnswer(
                  6,
                  questionId,
                  [selectedOption.id],
                  currentQuestionData.id
                );
              }
            }}
          />
          <View style={styles.bottomSpace} />
        </>
      );
    } else if (currentQuestionData.type === 4) {
      const currentSortedOptions =
        currentAnswer.length > 0
          ? currentAnswer.map((id) => {
              const option = currentQuestionData.options.find(
                (opt) => opt.id === id
              );
              return {
                id: String(id),
                text: option?.content || "",
              };
            })
          : mapOptionsToSortFormat(currentQuestionData.options);

      return (
        <>
          {renderProgressTitle()}
          <SortChoice
            question={currentQuestionData.content}
            description=""
            options={mapOptionsToSortFormat(currentQuestionData.options)}
            sortedOptions={currentSortedOptions}
            onSort={(value) => {
              const optionIds = value.map((v) => Number(v.id));
              updateAnswer(4, questionId, optionIds, currentQuestionData.id);
            }}
          />
        </>
      );
    } else if (currentQuestionData.type === 3) {
      return (
        <>
          {renderProgressTitle()}
          <SliderChoice
            question={currentQuestionData.content}
            description=""
            value={currentAnswer[0] ? currentAnswer[0] / 10 : 0}
            onValueChange={(value) => {
              updateAnswer(3, questionId, [value * 10], currentQuestionData.id);
            }}
          />
          <View style={styles.bottomSpace} />
        </>
      );
    } else if (currentQuestionData.type === 5) {
      return (
        <>
          {renderProgressTitle()}
          <SingleEmotionChoice
            question={currentQuestionData.content}
            description=""
            options={currentQuestionData.options.map((opt) => ({
              id: String(opt.id),
              content: opt.content,
              imgUrl: imgProxy(opt.image),
            }))}
            selectedEmotion={currentAnswer[0]?.toString()}
            onSelect={(value) => {
              const selectedOption = currentQuestionData.options.find(
                (opt) => String(opt.id) === value
              );
              if (selectedOption) {
                updateAnswer(
                  5,
                  questionId,
                  [selectedOption.id],
                  currentQuestionData.id
                );
              }
            }}
          />
          <View style={styles.bottomSpace} />
        </>
      );
    } else if (currentQuestionData.type === 8) {
      return (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderProgressTitle()}
          <ColorChoice
            question={currentQuestionData.content}
            description=""
            colorGroups={DEFAULT_COLOR_GROUPS}
            selectedColor={currentAnswer[0] || null}
            onSelect={(value) => {
              // const optionId = value.groupIndex * 10 + value.strengthIndex;
              // const selectedOption = currentQuestionData.options.find(opt => opt.id === optionId);
              // if (selectedOption) {
              //   updateAnswer(8, questionId, [selectedOption.id]);
              // }
              updateAnswer(8, questionId, [value], currentQuestionData.id);
            }}
            lowStrengthLabel="弱"
            highStrengthLabel="强"
          />
          <View style={styles.bottomSpace} />
        </ScrollView>
      );
    } else if (currentQuestionData.type === 9) {
      return (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderProgressTitle()}
          <ImageTextChoice
            question={currentQuestionData.content}
            description=""
            options={mapOptionsToImageTextFormat(currentQuestionData.options)}
            selectedOption={currentAnswer[0]?.toString()}
            onSelect={(value) => {
              const selectedOption = currentQuestionData.options.find(
                (opt) => String(opt.id) === value
              );
              if (selectedOption) {
                updateAnswer(
                  9,
                  questionId,
                  [selectedOption.id],
                  currentQuestionData.id
                );
              }
            }}
          />
          <View style={styles.bottomSpace} />
        </ScrollView>
      );
    } else if (currentQuestionData.type === 10) {
      return (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderProgressTitle()}
          <ImageTextChoice2
            question={currentQuestionData.content}
            description=""
            options={mapOptionsToImageText2Format(currentQuestionData.options)}
            selectedOption={currentAnswer[0]?.toString()}
            onSelect={(value) => {
              const selectedOption = currentQuestionData.options.find(
                (opt) => String(opt.id) === value
              );
              if (selectedOption) {
                updateAnswer(
                  10,
                  questionId,
                  [selectedOption.id],
                  currentQuestionData.id
                );
              }
            }}
          />
          <View style={styles.bottomSpace} />
        </ScrollView>
      );
    }

    return null;
  };

  const renderBottomBar = () => (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        style={[
          styles.submitButton,
          !canGoBack() && styles.iconContainerDisabled,
          styles.submitButtonLeft,
        ]}
        disabled={!canGoBack()}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color="#19DBF2" />
        <Text style={[styles.submitButtonText, { color: "#19DBF2" }]}>
          {t("test.previous")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.submitButton,
          styles.submitButtonActive,
          !getCurrentAnswer() && styles.submitButtonInactive,
        ]}
        disabled={!getCurrentAnswer() || isSubmitting}
        onPress={handleNextQuestion}
        activeOpacity={0.5}
      >
        <Text style={[styles.submitButtonText]}>
          {currentQuestion < questions.length - 1
            ? t("test.next")
            : t("test.submit")}
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderProgressBar = () => (
    <View style={{ paddingHorizontal: 16, marginTop: 4, marginBottom: 20 }}>
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${((currentQuestion + 1) * 100) / questions.length}%`,
              backgroundColor: "#19DBF2",
            },
          ]}
        />
      </View>
    </View>
  );

  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleExitConfirm = () => {
    router.back();
  };

  const getCurrentAnswer = () => {
    const currentQuestionData = questions[currentQuestion % questions.length];
    const questionId = `question_${currentQuestion}`;
    const currentAnswer = answers[questionId];

    if (!currentAnswer) return null;

    switch (currentQuestionData.type) {
      case 1:
        return currentAnswer.option_ids.length === 1 ? currentAnswer : null;
      case 2:
        return currentAnswer.option_ids.length > 0 ? currentAnswer : null;
      case 7:
        const total = currentAnswer.option_ids.reduce(
          (sum, value) => sum + value,
          0
        );
        return total === 100 ? currentAnswer : null;
      case 6:
        return currentAnswer.option_ids.length === 1 ? currentAnswer : null;
      case 4:
        return currentAnswer.option_ids.length > 0 ? currentAnswer : null;
      case 3:
        return currentAnswer.option_ids.length === 1 ? currentAnswer : null;
      case 5:
        return currentAnswer.option_ids.length === 1 ? currentAnswer : null;
      case 8:
        return currentAnswer.option_ids.length > 0 ? currentAnswer : null;
      case 9:
        return currentAnswer.option_ids.length === 1 ? currentAnswer : null;
      case 10:
        return currentAnswer.option_ids.length === 1 ? currentAnswer : null;
      default:
        return null;
    }
  };

  // 保存进度到服务器
  const saveProgress = async () => {
    try {
      const submission = formatAnswersForSubmission();
      setToastInfo({
        visible: true,
        message: t("test.saving"),
        type: "loading",
        duration: null,
        onDismiss: () => {},
      });
      const res = await testService.saveUserTestProgress({
        ...submission,
        ...{
          test_id: Number(params.id),
          progress: currentQuestion + 1,
        },
      });
      if (res.code === 200) {
        setToastInfo(undefined);
        return true;
      } else {
        setToastInfo({
          visible: true,
          message: res.message,
          type: "error",
          duration: 3000,
          onDismiss: () => {
            setToastInfo(undefined);
          },
        });
      }
      return false;
    } catch (error) {
      console.error("Error saving test progress:", error);
      return false;
    }
  };

  // 检查指定题目是否已回答
  const isQuestionAnswered = (questionIndex: number) => {
    const questionId = `question_${questionIndex}`;
    const currentQuestionData = questions[questionIndex % questions.length];

    switch (currentQuestionData.type) {
      case 1:
        return answers[questionId]?.option_ids.length > 0;
      case 2:
        return answers[questionId]?.option_ids.length > 0;
      case 7:
        return answers[questionId]?.option_ids.length > 0;
      case 6:
        return answers[questionId]?.option_ids.length > 0;
      case 4:
        return answers[questionId]?.option_ids.length > 0;
      case 3:
        return answers[questionId]?.option_ids.length > 0;
      case 5:
        return answers[questionId]?.option_ids.length > 0;
      case 8:
        return answers[questionId]?.option_ids.length > 0;
      case 9:
        return answers[questionId]?.option_ids.length > 0;
      case 10:
        return answers[questionId]?.option_ids.length > 0;
      default:
        return false;
    }
  };

  // 检查是否可以前进
  const canGoForward = () => {
    return (
      currentQuestion < questions.length - 1 &&
      isQuestionAnswered(currentQuestion)
    );
  };

  // 检查是否可以后退
  const canGoBack = () => {
    return currentQuestion > 0;
  };

  // 处理前进
  const handleForward = () => {
    if (canGoForward()) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // 处理后退
  const handleBack = () => {
    if (canGoBack()) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#19DBF2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NotificationToast />
      <LinearGradient
        colors={["#92F4FF", "#fff"]}
        style={{ position: "absolute", inset: 0 }}
      />
      {questions.length ? (
        <>
          <View style={[styles.header, { marginTop: insets.top }]}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleExit}>
              <Image
                source={require("@/assets/images/common/icon-back.png")}
                style={{ width: 24, height: 24 }}
              />
            </TouchableOpacity>
            <View style={[styles.container, { paddingRight: 36 }]}>
              <Text style={styles.scrollViewTitle} numberOfLines={1}>
                {questions[currentQuestion % questions.length].content}
              </Text>
            </View>
          </View>
          <View style={[styles.container]}>
            <View style={styles.container}>{renderQuestion()}</View>
            {renderBottomBar()}
          </View>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
          }}
        >
          <ActivityIndicator size="large" color="#19DBF2" />
        </View>
      )}

      <ExitTestModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitConfirm}
        onSave={handleExitSave}
        toastInfo={toastInfo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    height: 44,
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollViewTitle: {
    fontSize: 16,
    ...createFontStyle("700"),
    color: "#0C0A09",
    textTransform: "capitalize",
  },
  progressText: {
    fontSize: 12,
    color: "#515C66",
    ...createFontStyle("400"),
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  testTitleContainer: {
    marginTop: 20,
    width: "100%",
    height: 25,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  testTitleTextContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  testTitleText: {
    color: "#515C66",
    fontSize: 14,
    ...createFontStyle("700"),
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  progressContainer: {
    height: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 20,
  },
  answerContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    boxShadow: "0px 2px 8px 0px rgba(18, 99, 107, 0.12)",
  },
  bottomSpace: {
    height: 150,
  },
  bottomBar: {
    flexDirection: "row",
    gap: 12,
    position: "absolute",
    width: "100%",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  submitButton: {
    flex: 1,
    height: 48,
    paddingHorizontal: 10,
    borderRadius: 78,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  submitButtonLeft: {
    borderWidth: 1,
    borderColor: "#19DBF2",
  },
  submitButtonActive: {
    backgroundColor: "#19DBF2",
  },
  submitButtonInactive: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    ...createFontStyle("600"),
    textTransform: "uppercase",
    color: "#FFFFFF",
  },
  iconContainerDisabled: {
    opacity: 0.5,
  },
});
