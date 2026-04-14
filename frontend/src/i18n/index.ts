import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enUS from "../locales/en-US/common.json";
import ptBR from "../locales/pt-BR/common.json";

export const defaultLanguage = "pt-BR";

export const resources = {
  "pt-BR": { translation: ptBR },
  "en-US": { translation: enUS }
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false
  },
  supportedLngs: ["pt-BR", "en-US"]
});

export default i18n;
