import { Toaster } from "react-hot-toast";
import "./global.css";
import Provider from "./provider";
import { Poppins } from "next/font/google";

export const metadata = {
  title: "MyShop Seller",
  description: "EShop for sellers",
};

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poopins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-slate-900 ${poppins.className}`}>
        <Provider>{children}</Provider>
        <Toaster />
      </body>
    </html>
  );
}
