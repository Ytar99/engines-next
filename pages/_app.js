import { ToastContainer } from "react-toastify";
import { SessionProvider } from "next-auth/react";
import { AppCacheProvider } from "@mui/material-nextjs/v15-pagesRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import { Roboto } from "next/font/google";

import "@/styles/globals.css";

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
  },

  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  // palette: {
  //   mode: "light",
  //   primary: {
  //     main: "#000000",
  //   },
  //   secondary: {
  //     main: "#f50057",
  //   },
  // },
  colorSchemes: {
    light: {},
    dark: {},
  },
  palette: {
    // mode: "light",
    // primary: {
    //   main: "#2D3436", // Тёмно-графитовый (основные кнопки, заголовки)
    //   contrastText: "#FFFFFF",
    // },
    // secondary: {
    //   main: "#636E72", // Мягкий серый (второстепенные элементы)
    //   contrastText: "#FFFFFF",
    // },
    // background: {
    //   default: "#F5F5F5", // Светло-серый (фон страницы)
    //   paper: "#FFFFFF", // Белый (карточки товаров)
    // },
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
