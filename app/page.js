import "use client";
import { motion } from 'framer-motion';
import MagneticEffect from '../components/MagneticEffect';
import Divider from '../components/Divider';
import BentoBox from '../components/BentoBox';
import RetroFuturismComponent from '../components/RetroFuturismComponent';
import ARSpaceComponent from '../components/ARSpaceComponent';

export default function Page() {
  return (
    <>  
      <section id='hero' className='h-screen bg-cover bg-center bg-starfield' style={{backgroundImage: "url('/starfield.jpg')"}}>
        <RetroFuturismComponent />
        <ARSpaceComponent />
      </section>
      <section id='features' className='px-12 py-32 text-center'>
        <Divider />
        <h2 className='text-4xl font-bold mb-12 font-logo text-emerald-400'>Features</h2>
        <BentoBox />
      </section>
    </>
  );
}
