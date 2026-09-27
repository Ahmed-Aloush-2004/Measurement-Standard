
import React, { useMemo } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { ExamType } from "@/src/store/sectionsSlice";

interface CategoryGridProps {
  examTypes: ExamType[];
  onExamPress: (examType: ExamType) => void;
  onProgressPress: () => void;
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

interface ExamVisual {
  backgroundColor: string;
  buttonColor: string;
  icon: IconName;
  /** Renders as a filled circle with text instead of an icon. */
  badge?: string;
}

/**
 * The visual slots, in order. Every exam that is not in EXAM_VISUALS is handed
 * out one of these by getExamVisuals, so a new exam created from the admin
 * panel is styled automatically instead of falling through to one shared look.
 * The two colours per slot are a pale tint for the card and a saturated tone for
 * the button, which carries white text.
 */
const PALETTE: ExamVisual[] = [
  { backgroundColor: "#E7F4FD", buttonColor: "#168FD4", icon: "school", badge: "STEP" },
  { backgroundColor: "#E4F8F4", buttonColor: "#20B7A5", icon: "calculator-variant" },
  { backgroundColor: "#FFF0E5", buttonColor: "#F08035", icon: "book-open-page-variant" },
  { backgroundColor: "#E8EDFD", buttonColor: "#4C6EF5", icon: "scale-balance" },
  { backgroundColor: "#FFE9F2", buttonColor: "#D63384", icon: "target" },
  { backgroundColor: "#E9F9EC", buttonColor: "#2F9E44", icon: "lightbulb-on" },
  { backgroundColor: "#FFF4E6", buttonColor: "#E8590C", icon: "abjad-arabic" },
  { backgroundColor: "#F0E7FF", buttonColor: "#7641D8", icon: "pencil-ruler" },
];

/**
 * Exams that exist today, pinned to a slot so their colour never shifts when an
 * unrelated exam is added. Keep this in the same order as the backend's exam
 * types (see prisma/sql/*.sql).
 */
const PINNED: Record<string, number> = {
  STEP: 0,
  GENERAL_APTITUDE: 1,
  ACHIEVEMENT: 2,
  QIYAS: 3,
  TIMSS: 4,
  ACHJUMAN: 5,
  IRODORI: 6,
  PRACTICE: 7,
};

/** Stable string hash, so an unknown exam keeps the same slot across renders. */
function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Resolve one visual per exam type.
 *
 * Pinned codes take their slot first so the known set is fixed. Every other code
 * then probes forward from its hash for the first slot still free, which keeps
 * the mapping stable per code while making two new exams added together come out
 * different rather than identical.
 */
function getExamVisuals(examTypes: ExamType[]) {
  const taken = new Set<number>();
  const result = new Map<string, ExamVisual>();

  for (const examType of examTypes) {
    const slot = PINNED[examType.code];
    if (slot === undefined || taken.has(slot)) continue;
    taken.add(slot);
    result.set(examType.code, PALETTE[slot]);
  }

  for (const examType of examTypes) {
    if (result.has(examType.code)) continue;
    const start = hashCode(examType.code) % PALETTE.length;
    let slot = start;
    for (let i = 0; i < PALETTE.length; i++) {
      const candidate = (start + i) % PALETTE.length;
      if (!taken.has(candidate)) {
        slot = candidate;
        break;
      }
    }
    taken.add(slot);
    result.set(examType.code, PALETTE[slot]);
  }

  return result;
}

export default function CategoryGrid({
  examTypes = [], // Fallback default
  onExamPress,
  onProgressPress,
}: CategoryGridProps) {
  // Built once per list so the colour of one card cannot depend on the others.
  const visuals = useMemo(() => getExamVisuals(examTypes), [examTypes]);

  return (
    <View className="px-5 mt-4">
      <View className="flex-row items-center justify-end mb-3">
        <Text className="text-[#202020] text-[13px] font-black">
          الاختبارات الرئيسية
        </Text>

        <Ionicons
          name="grid-outline"
          size={18}
          color="#5E6392"
          style={{ margin:5,marginBottom:10 }}
        />
      </View>

      <View className="flex-row flex-wrap justify-between">
        {examTypes?.map((examType) => {
          // Keyed by code, so a new exam resolves through the palette
          const visual = visuals.get(examType.code) ?? PALETTE[0];

          const questionCount =
            examType.sections?.reduce(
              (total, section) => total + (section.questions?.length ?? 0),
              0
            ) ?? 0;

          return (
            <TouchableOpacity
              key={examType.id}
              onPress={() => onExamPress(examType)}
              activeOpacity={0.82}
              // Increased height to 145px and added mb-3 for breathing room
              className="w-[48%] h-[145px] rounded-[14px] px-3 py-4 items-center justify-between mb-3"
              style={{
                backgroundColor: visual.backgroundColor,
              }}
            >
              <View className="h-[35px] items-center justify-center">
                {visual.badge ? (
                  <View
                    className="w-[35px] h-[35px] rounded-full items-center justify-center"
                    style={{ backgroundColor: visual.buttonColor }}
                  >
                    <Text className="text-white text-[10px] font-black">
                      {visual.badge}
                    </Text>
                  </View>
                ) : (
                  <MaterialCommunityIcons
                    name={visual.icon}
                    size={32}
                    color={visual.buttonColor}
                  />
                )}
              </View>

              <View className="items-center flex-1 justify-center mt-2 mb-2">
                <Text
                  numberOfLines={2}
                  className="text-[#171717] text-[12px] font-black text-center leading-4"
                >
                  {examType.name}
                </Text>

                <Text
                  numberOfLines={1}
                  className="text-[#77777D] text-[9px] font-medium mt-1"
                >
                  {examType.sections?.length ?? 0} أقسام
                  {questionCount > 0 ? ` • ${questionCount} سؤال` : ""}
                </Text>
              </View>

              <View
                className="px-4 h-[25px] rounded-[7px] items-center justify-center w-[80%]"
                style={{
                  backgroundColor: visual.buttonColor,
                }}
              >
                <Text className="text-white text-[10px] font-bold">
                  ابدأ الآن
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={onProgressPress}
          activeOpacity={0.82}
          // Matched height to 145px
          className="w-[48%] h-[145px] rounded-[14px] px-3 py-4 items-center justify-between bg-[#FFECEF] mb-3"
        >
          <View className="h-[35px] items-center justify-center">
            <Ionicons name="stats-chart" size={32} color="#E85D87" />
          </View>

          <View className="items-center flex-1 justify-center mt-2 mb-2">
            <Text className="text-[#171717] text-[13px] font-black text-center">
              نتيجتي وتقدمي
            </Text>

            <Text className="text-[#77777D] text-[9px] font-medium mt-1 text-center">
              تابع مستوياتك وتحليلك
            </Text>
          </View>

          <View className="px-4 h-[25px] rounded-[7px] bg-[#E85D87] items-center justify-center w-[80%]">
            <Text className="text-white text-[10px] font-bold">عرض</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
