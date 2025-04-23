import "./global.css";
import Provider from "./provider";

export const metadata = {
  title: "MyShop Seller",
  description: "EShop for sellers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
