"use client";
import { motion } from 'framer-motion';

const featuresData = [
  {
    title: "Adaptive Intelligence",
    desc: "Monitors itself and identifies strengths and weaknesses in real-time."
  },
  {
    title: "Dynamic Design",
    desc: "No fixed layouts. AI evolves the look and feel continuously."
  },
  {
    title: "Living Growth",
    desc: "Learns from users and adapts to trends, keeping it always ahead."
  }
];

export default function BentoBox() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {featuresData.map((feature, index) => (
        <motion.div
          key={index}
          className="p-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05 }}
        >
          <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
          <p className="text-white mt-2">{feature.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}