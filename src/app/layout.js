import Providers from '../components/Providers';
import './globals.css';

export const metadata = {
  title: 'Habit Tracker',
  description: 'Track your daily habits and build streaks',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}