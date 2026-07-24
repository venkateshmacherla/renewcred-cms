import PublicHeader from "@/components/PublicHeader";
import "./globals.css";

export const metadata = {
  title: "RenewCred",
  description: "Dynamic content powered by RenewCred CMS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <PublicHeader />
        {children}
      </body>
    </html>
  );
}
