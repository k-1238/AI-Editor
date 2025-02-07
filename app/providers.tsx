"use client";

import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import useLocalStorage from "@/hooks/use-local-storage";
import { v4 as uuidv4 } from "uuid";
import { SessionProvider } from "next-auth/react";
export const AppContext = createContext<{
  font: string;
  setFont: Dispatch<SetStateAction<string>>;
}>({
  font: "Default",
  setFont: () => {},
});

const ToasterProvider = () => {
  const { theme } = useTheme() as {
    theme: "light" | "dark" | "system";
  };
  return <Toaster theme={theme} />;
};

const SessionUUIDContext = createContext<{
  sessionUUID: string;
  setSessionId: () => void;
} | null>(null);
// Helper hook to use the SessionUUID context
export const useSessionUUID = () => {
  const context = useContext(SessionUUIDContext);
  if (!context) {
    throw new Error("useSessionUUID must be used within a SessionUUIDProvider");
  }
  return context;
};

export default function Providers({ children }: { children: ReactNode }) {
  const [font, setFont] = useLocalStorage<string>("novel__font", "Default");
  const [sessionUUID, setSessionUUID] = useState<string>(uuidv4());
  const setSessionId = () => {
    setSessionUUID(uuidv4());
  };

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        enableSystem
        disableTransitionOnChange
        defaultTheme="dark">
        <SessionUUIDContext.Provider value={{ sessionUUID, setSessionId }}>
          <AppContext.Provider
            value={{
              font,
              setFont,
            }}>
            <ToasterProvider />
            {children}
            <Analytics />
          </AppContext.Provider>
        </SessionUUIDContext.Provider>
      </ThemeProvider>
    </SessionProvider>
  );
}
