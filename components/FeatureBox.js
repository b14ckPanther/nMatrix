import { motion } from 'framer-motion';

export default function FeatureBox({ title, desc }) {
  return (
    <motion.div
      className='bg-gray-900/50 p-5 rounded-lg shadow-2xl text-center hover:bg-gray-800 transition ease-in-out transform hover:-translate-y-2 hover:scale-105'
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h3 className='text-3xl font-bold mb-2 text-emerald-500'>{title}</h3>
      <p className='text-gray-400'>{desc}</p>
    </motion.div>
  );
}