export const intlMessages = {
  "en-US": {
    buttonLabel: "Show suggestions",
    listboxLabel: "Suggestions",
    countAnnouncement: "{optionCount, plural, =0 {No suggestions} one {# suggestion} other {# suggestions}} available.",
    selectedAnnouncement: "{optionText} selected.",
    focusAnnouncement:
      "{isGroupChange, select, true {{groupTitle}, {groupCount, plural, one {# option} other {# options}}. } other {}}{optionText}{isSelected, select, true {, selected} other {}}.",
  },
} as const;
