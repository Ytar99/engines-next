import { ToastContainer } from "react-toastify";
import { SessionProvider } from "next-auth/react";
import { AppCacheProvider } from "@mui/material-nextjs/v15-pagesRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { alpha, CssBaseline } from "@mui/material";
import { Roboto } from "next/font/google";

import { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";

registerLocale("ru", ru);

import "@/styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const theme = createTheme({
  components: {
    MuiInputBase: {
      defaultProps: {
        slotProps: {
          inputLabel: { shrink: true },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: (theme) => `
        :root {
          --datepicker-font-family: ${theme.typography.fontFamily};
          --datepicker-font-size: ${theme.typography.caption.fontSize};
          --datepicker-header-font-size: ${theme.typography.body1.fontSize};
          --datepicker-bg: ${theme.palette.background.paper};
          --datepicker-text-color: ${theme.palette.text.primary};
          --datepicker-border-color: ${theme.palette.divider};
          --datepicker-border-radius: ${theme.shape.borderRadius}px;
          --datepicker-header-bg: ${theme.palette.background.default};
          --datepicker-header-text-color: ${theme.palette.text.primary};
          --datepicker-arrow-color: ${theme.palette.text.disabled};
          --datepicker-arrow-hover-color: ${theme.palette.text.secondary};
          --datepicker-selected-bg: ${theme.palette.primary.main};
          --datepicker-selected-text-color: ${theme.palette.primary.contrastText};
          --datepicker-selected-hover-bg: ${theme.palette.primary.dark};
          --datepicker-hover-bg: ${theme.palette.grey[500]};
          --datepicker-highlighted-bg: ${theme.palette.success.main};
          --datepicker-highlighted-text-color: ${theme.palette.success.contrastText};
          --datepicker-highlighted-hover-bg: ${theme.palette.success.dark};
          --datepicker-holiday-bg: ${theme.palette.warning.main};
          --datepicker-holiday-text-color: ${theme.palette.warning.contrastText};
          --datepicker-holiday-hover-bg: ${theme.palette.warning.dark};
          --datepicker-in-range-bg: ${alpha(theme.palette.primary.main, 0.5)};
          --datepicker-keyboard-selected-bg: ${theme.palette.primary.light};
          --datepicker-keyboard-selected-text-color: ${theme.palette.text.primary};
          --datepicker-disabled-color: ${theme.palette.text.disabled};
          --datepicker-overlay-bg: ${theme.palette.grey[900]};
          --datepicker-overlay-text-color: ${theme.palette.common.white};
          --datepicker-close-icon-bg: ${theme.palette.primary.main};
          --datepicker-close-icon-text-color: ${theme.palette.primary.contrastText};
          --datepicker-close-icon-disabled-bg: ${theme.palette.text.disabled};
          --datepicker-portal-bg: ${theme.palette.grey[800]};
        }
      `,
    },
  },

  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {},
    dark: {},
  },
});

export default function App({ Component, pageProps }) {
  return (
    <AppCacheProvider {...pageProps}>
      <ThemeProvider theme={theme} defaultMode="light">
        <CssBaseline />
        <SessionProvider session={pageProps.session}>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <Component {...pageProps} />
        </SessionProvider>
      </ThemeProvider>
    </AppCacheProvider>
  );
}
