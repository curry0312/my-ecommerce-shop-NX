import "./global.css";
import Header from "../shared/widgets/header";
import { Poppins, Roboto } from "next/font/google";
import Providers from "./providers";

export const metadata = {
  title: "My-shop",
  description: "EShop",
};

const robotoFont = Roboto({
  weight: ["100", "300", "400", "500", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${robotoFont.variable} ${poppins.variable}`}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
