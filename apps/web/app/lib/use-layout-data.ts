import { useRouteLoaderData } from "react-router";
import { DEFAULT_LOCALE } from "@elektro/shared";
import type { LocaleLayoutData } from "../routes/locale-layout";

/** The locale and signed-in user loaded once by `routes/locale-layout`. */
export function useLayoutData(): LocaleLayoutData {
  return (
    useRouteLoaderData<LocaleLayoutData>("routes/locale-layout") ?? {
      locale: DEFAULT_LOCALE,
      user: null,
    }
  );
}
