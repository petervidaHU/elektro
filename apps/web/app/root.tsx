import "@mantine/core/styles.css";

import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { localeFromPathname, localePath } from "./i18n/locale";
import { theme } from "./theme";

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const locale = localeFromPathname(pathname);

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <meta charSet="utf-8" />
        {/* Touch-first: the app is used on phones, so no zoom lock-out. */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          {children}
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const locale = localeFromPathname(pathname);

  const message = isRouteErrorResponse(error)
    ? error.status === 404
      ? t("error.pageNotFound")
      : t("error.INTERNAL_ERROR")
    : t("error.INTERNAL_ERROR");

  return (
    <main style={{ padding: "1.5rem", maxWidth: "40rem", margin: "0 auto" }}>
      <h1>{t("app.name")}</h1>
      <p>{message}</p>
      <a href={localePath(locale)}>{t("error.backHome")}</a>
    </main>
  );
}
