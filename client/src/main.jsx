import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";

import App from "./App.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";
import { wagmiConfig } from "./wagmi.js";

import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

const queryClient = new QueryClient();

// RainbowKit's modals render in their own portal with their own theme, so they
// have to be told about the app theme explicitly — otherwise a dark page opens
// a blinding white wallet dialog.
function RainbowKitThemeBridge({ children }) {
  const { theme } = useTheme();

  const rainbowTheme = React.useMemo(() => {
    const shared = {
      accentColorForeground: theme === "dark" ? "#0D1117" : "#FFFFFF",
      borderRadius: "medium",
      fontStack: "system",
      overlayBlur: "small",
    };
    return theme === "dark"
      ? darkTheme({ ...shared, accentColor: "#56D4C1" })
      : lightTheme({ ...shared, accentColor: "#0D766C" });
  }, [theme]);

  return (
    <RainbowKitProvider
      theme={rainbowTheme}
      appInfo={{ appName: "KarmaLedger" }}
      modalSize="compact"
    >
      {children}
    </RainbowKitProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitThemeBridge>
            <ToastProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ToastProvider>
          </RainbowKitThemeBridge>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </React.StrictMode>
);