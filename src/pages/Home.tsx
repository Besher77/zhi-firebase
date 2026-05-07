import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import CategoryGrid from '../components/CategoryGrid';
import BestSelling from '../components/BestSelling';
import CoffeeTypes from '../components/CoffeeTypes';
import WhyChooseUs from '../components/WhyChooseUs';
import FeaturedProduct from '../components/FeaturedProduct';
import VideoStory from '../components/VideoStory';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <>
      <Hero />
      <Benefits />
      <CategoryGrid />
      <BestSelling />
      <CoffeeTypes />
      <WhyChooseUs />
      <FeaturedProduct />
      <VideoStory />
      <Testimonials />
    </>
  );
}
