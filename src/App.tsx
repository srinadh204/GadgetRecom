import { RouterProvider, useRouter } from '@/lib/router';
import { CompareProvider } from '@/lib/compare';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { BrowsePage } from '@/pages/BrowsePage';
import { GadgetDetailPage } from '@/pages/GadgetDetailPage';
import { QuizPage } from '@/pages/QuizPage';
import { ComparePage } from '@/pages/ComparePage';
import { AboutPage } from '@/pages/AboutPage';

function Routes() {
  const { path, params } = useRouter();

  const renderPage = () => {
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) return <HomePage />;
    if (segments[0] === 'browse') return <BrowsePage />;
    if (segments[0] === 'gadgets' && params.slug) return <GadgetDetailPage />;
    if (segments[0] === 'quiz') return <QuizPage />;
    if (segments[0] === 'compare') return <ComparePage />;
    if (segments[0] === 'about') return <AboutPage />;
    return <HomePage />;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <CompareProvider>
        <Routes />
      </CompareProvider>
    </RouterProvider>
  );
}
