
import { motion } from 'framer-motion';

export default function ARComponent() {
  return (
    <motion.div className='ar-overlay fixed inset-0 flex items-center justify-center pointer-events-none'>
      <motion.div className='content bg-white p-8 rounded shadow-lg'
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <h1 className='text-3xl font-bold mb-4'>Augmented Reality Experience</h1>
        <p className='text-lg'>Immerse yourself in a new realm where digital overlaps with reality.</p>
      </motion.div>
    </motion.div>
  );
}
