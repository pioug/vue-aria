import { useLocale, useLocalizedStringDictionary } from "@vue-aria/i18n";
import { intlMessages } from "./intlMessages";

type Field = Intl.DateTimeFormatPartTypes;

interface DisplayNames {
  of(field: Field): string | undefined;
}

/** @private */
export function useDisplayNames(): DisplayNames {
  const locale = useLocale();
  const dictionary = useLocalizedStringDictionary(
    intlMessages as any,
    "@react-aria/datepicker"
  );

  return {
    of(field: Field) {
      try {
        const displayNames = new Intl.DisplayNames(locale.value.locale, {
          type: "dateTimeField" as any,
        });
        return displayNames.of(field as any) ?? undefined;
      } catch {
        return (dictionary as any).getStringForLocale(field, locale.value.locale);
      }
    },
  };
}
