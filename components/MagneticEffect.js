"use client";
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MagneticEffect({ children, strength = 20 }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    if (ref.current) {
        const { width, height, left, top } = ref.current.getBoundingClientRect();
        setPos({
          x: clientX - (left + width / 2),
          y: clientY - (top + height / 2),
        });
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x * (strength / 100), y: pos.y * (strength / 100) }}
      transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
    >
      {children}
    </motion.div>
  );
};