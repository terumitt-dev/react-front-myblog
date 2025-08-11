// app/src/components/utils/colors.ts
export const CATEGORY_COLORS = {
  hobby: {
    bg: "bg-[#E1C6F9]",
    hex: "#E1C6F9",
    name: "しゅみ",
    focusRing: "focus:ring-purple-300",
  },
  tech: {
    bg: "bg-[#AFEBFF]",
    hex: "#AFEBFF",
    name: "テック",
    focusRing: "focus:ring-blue-300",
  },
  other: {
    bg: "bg-[#CCF5B1]",
    hex: "#CCF5B1",
    name: "その他",
    focusRing: "focus:ring-green-300",
  },
} as const;

export type CategoryType = keyof typeof CATEGORY_COLORS;
