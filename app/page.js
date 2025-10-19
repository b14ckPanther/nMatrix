"use client";
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import MagneticEffect from '../components/MagneticEffect';
import Divider from '../components/Divider';
import BentoBox from '../components/BentoBox';
import RetroFuturismComponent from '../components/RetroFuturismComponent';

export default function Page() {
  return (
    <>
      <section id='hero' className='h-screen bg-cover bg-center' style={{backgroundImage: "url('/retro-futuristic-background.jpg')"}}>
        <RetroFuturismComponent />
      </section>
      <section id='features' className='px-12 py-32 text-center'>
        <Divider />
        <h2 className='text-4xl font-bold mb-12 font-logo text-emerald-400'>Features</h2>
        <BentoBox />
      </section>
    </>
  );
}
