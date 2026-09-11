import { CategoryCardData, BottomTab } from "@/src/types/home";

export const CATEGORY_CARDS: CategoryCardData[] = [
  {
    id: "quantitative",
    title: "القدرات الكمية",
    subtitle: "+30 سؤال تدريبي",
    buttonText: "ابدأ الآن",
    icon: "calculator-variant",
    backgroundColor: "#E5F7F4",
    iconColor: "#16B89C",
    buttonColor: "#16B89C",
  },

  {
    id: "verbal",
    title: "القدرات اللفظية",
    subtitle: "+30 سؤال تدريبي",
    buttonText: "ابدأ الآن",
    icon: "brain",
    backgroundColor: "#F0E8FF",
    iconColor: "#8B4DE8",
    buttonColor: "#8145DC",
  },

  {
    id: "step",
    title: "STEP",
    subtitle: "تدرب على اختبار STEP",
    buttonText: "ابدأ الآن",
    icon: "alpha-s-circle",
    backgroundColor: "#E4F2FC",
    iconColor: "#168BD8",
    buttonColor: "#168BD8",
  },

  {
    id: "achievement",
    title: "التحصيلي",
    subtitle: "جميع مواد التحصيلي",
    buttonText: "ابدأ الآن",
    icon: "book-open-page-variant",
    backgroundColor: "#FFF0E3",
    iconColor: "#EF8637",
    buttonColor: "#F18A3A",
  },

  {
    id: "tests",
    title: "اختبارات تجريبية",
    subtitle: "اختبارات شاملة محاكية",
    buttonText: "ابدأ الآن",
    icon: "clipboard-text-outline",
    backgroundColor: "#FFF8DD",
    iconColor: "#E5BC22",
    buttonColor: "#E5BD27",
  },

  {
    id: "results",
    title: "نتيجتي وتقدمي",
    subtitle: "تابع مستوياتك وتطورك",
    buttonText: "ابدأ الآن",
    icon: "chart-line",
    backgroundColor: "#FFE9ED",
    iconColor: "#E65A82",
    buttonColor: "#E65A82",
  },
];

export const BOTTOM_TABS: BottomTab[] = [
  {
    id: "more",
    label: "المزيد",
    icon: "apps",
    activeIcon: "apps",
  },
  {
    id: "favorites",
    label: "المفضلة",
    icon: "star-outline",
    activeIcon: "star",
  },
  {
    id: "home",
    label: "الرئيسية",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    id: "tests",
    label: "الاختبارات",
    icon: "clipboard-outline",
    activeIcon: "clipboard",
  },
  {
    id: "profile",
    label: "ملفي",
    icon: "account-outline",
    activeIcon: "account",
  },
];