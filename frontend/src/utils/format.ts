import i18n, { defaultLanguage } from "../i18n";

function getLocale() {
  return i18n.resolvedLanguage ?? i18n.language ?? defaultLanguage;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(getLocale(), {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(getLocale()).format(value);
}

export function formatCurrency(value: number) {
  const currency = i18n.t("format.currencyCode");

  return new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency
  }).format(value);
}
