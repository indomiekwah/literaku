import { useReadingPreferences } from "@/contexts/ReadingPreferences";
import { getTranslations } from "@/constants/translations";

export function useT() {
  const { language } = useReadingPreferences();
  return getTranslations(language);
}
