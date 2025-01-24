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
interface UserType {
  user: {
    pk: number;
    username: string;
    email: string;
    id: string;
    first_name: string;
    last_name: string;
    refreshToken: string;
    accessToken: string;
  };
  expires: string;
}
const AuthContext = createContext<{
  userInfo: UserType | null;
  setUserInfo: React.Dispatch<React.SetStateAction<UserType | null>>;
} | null>(null);

export function useAuthState() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthState must be used within an AuthContext.Provider");
  }
  return context;
}
export const UserInfoProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<UserType | null>(null);

  return (
    <AuthContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

const SessionUUIDContext = createContext<string>("");
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
  const sessionUUID = uuidv4();
  return (
    <UserInfoProvider>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          enableSystem
          disableTransitionOnChange
          defaultTheme="system">
          <SessionUUIDContext.Provider value={sessionUUID}>
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
    </UserInfoProvider>
  );
}
