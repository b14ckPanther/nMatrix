import { motion } from 'framer-motion';

export default function RetroFuturismComponent() {
  return (
    <div className='text-center px-8 py-16 bg-black text-white'>
      <motion.h2
        className='text-5xl font-bold neon-text'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        Welcome to the Future
      </motion.h2>
      <p className='mt-6 max-w-2xl mx-auto text-lg'>
        Explore the cutting-edge technology with a nostalgic twist.
      </p>
    </div>
  );
}
