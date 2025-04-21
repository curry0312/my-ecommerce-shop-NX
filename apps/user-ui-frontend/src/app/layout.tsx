import './global.css';
import Header from './shared/widgets/header';

export const metadata = {
  title: 'My-shop',
  description: 'EShop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        </body>
    </html>
  )
}
