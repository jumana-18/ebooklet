import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { CategorySlider } from '../components/CategorySlider';
import { TrendingSection } from '../components/TrendingSection';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { NewArrivals } from '../components/NewArrivals';
import { PhysicalBooksSection } from '../components/PhysicalBooksSection';
import { AutumnSaleBanner } from '../components/AutumnSaleBanner';
import { ValueProps } from '../components/ValueProps';
import { AuthorSpotlight } from '../components/AuthorSpotlight';
import { CommunityReviews } from '../components/CommunityReviews';

export const HomeView = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('scroll') === 'genres') {
      setTimeout(() => {
        const element = document.getElementById('genres-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [location.search]);

  return (
    <main className="max-w-screen-2xl mx-auto space-y-2">
      <Hero />
      <CategorySlider />
      <TrendingSection />
      <RecentlyViewed />
      <NewArrivals />
      <PhysicalBooksSection />
      <AutumnSaleBanner />
      <ValueProps />
      <CommunityReviews />
    </main>
  );
};
