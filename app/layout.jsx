import "./globals.css";
import { ThemeProvider } from "@/components/Theme/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

import { SettingsProvider } from "@/context/SettingsContext";

export const metadata = {
  title: "Building Management System",
  description: "Building Management System Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider>
          <SettingsProvider>
            
          <AuthProvider>
            {children}
          </AuthProvider>

          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}