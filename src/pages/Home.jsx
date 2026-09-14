import Process from '../components/sections/Process';
import ProductCarousel from '../components/sections/ProductCarousel';
import OurWorks from '../components/sections/OurWorks'; // <-- Importar galería de trabajos desde DB
import AboutUs from '../components/sections/AboutUs'; 
import Location from '../components/sections/Location';

export default function Home() {
  return (
    <div>
      

<ProductCarousel />
      <OurWorks />
      <Process />
      <AboutUs /> 
      <Location />
    </div>
  );
}