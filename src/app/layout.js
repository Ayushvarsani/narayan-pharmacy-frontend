import Header from '@/components/Header';
import './globals.css';

export const metadata = {
  title: 'Narayan Pharmacy - Drug Interaction Checker',
  description: 'AI-powered clinical prescription entry & drug interaction checker.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div className="app-container">
          <Header />
          <main className="main-content">
            {children}
          </main>
          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Narayan Pharmacy SaaS. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
