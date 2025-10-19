"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// Home Component
export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white scroll-smooth">
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16,185,129,0.15), transparent 80%)`,
        }}
      />

      <section
        id="hero"
        className="flex flex-col items-center justify-center text-center py-32 px-6 bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/hero-background.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <MagneticEffect strength={20}>
          <motion.h1
            className="font-logo font-bold text-8xl md:text-9xl bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent animate-gradient"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            nMatrix
          </motion.h1>
        </MagneticEffect>
        <motion.p
          className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto font-['Exo_2'] glass backdrop-blur-md p-4 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          A living website that adapts, critiques, and redesigns itself.
          <br />
          Powered by AI — always evolving, never static.
        </motion.p>
      </section>

      <section id="features" className="px-12 py-32 text-center">
        <Divider />
        <h2 className="text-4xl font-bold mb-12 font-logo text-emerald-400">
          Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Adaptive Intelligence",
              desc: "Monitors itself and identifies strengths and weaknesses in real time.",
            },
            {
              title: "Dynamic Design",
              desc: "No fixed layouts. AI evolves the look and feel continuously.",
            },
            {
              title: "Living Growth",
              desc: "Learns from users and adapts to trends, keeping it always ahead.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-800/50 p-8 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] transition transform hover:-translate-y-2 hover:scale-105"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.3, duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4 text-emerald-400">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="about" className="px-12 py-32 text-center">
        <Divider />
        <h2 className="text-4xl font-bold mb-6 font-logo text-emerald-400">
          About
        </h2>
        <motion.p
          className="text-gray-400 max-w-2xl mx-auto font-['Exo_2']"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="text-emerald-400 font-semibold">nMatrix</span> is not
          just a site — it’s an evolving digital entity. Designed by {" "}
          <span className="font-semibold text-emerald-400">nmProfessor</span>, it
          pushes the boundaries of design, intelligence, and creativity on the
          web.
        </motion.p>
        <img
          src="https://via.placeholder.com/400"
          alt="Placeholder image for testing"
          className="mx-auto mt-8 rounded-lg"
          loading="lazy"
        />
      </section>

      <section id="contact" className="px-12 py-32 text-center bg-gray-800/30">
        <Divider />
        <h2 className="text-4xl font-bold mb-6 font-logo text-emerald-400">
          Get in Touch
        </h2>
        <motion.p
          className="text-gray-400 max-w-2xl mx-auto font-['Exo_2'] mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          Have ideas, feedback, or just curious to connect? Reach out and be
          part of the evolution.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <motion.a
            href="mailto:nmCryptoinvest@gmail.com"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-green-400 to-cyan-500 text-black shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] transition"
          >
            Email Me
          </motion.a>
          <motion.a
            href="https://github.com/b14ckPanther"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg font-medium border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 transition"
          >
            GitHub
          </motion.a>
          <motion.a
            href="https://www.linkedin.com/in/nmprofessor"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-lg font-medium border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition"
          >
            LinkedIn
          </motion.a>
        </div>
      </section>

      <footer className="flex flex-col items-center justify-center text-center py-12 border-t border-gray-700/50">
        <p
          className="font-logo text-3xl bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent"
          style={{ textShadow: "0 0 12px rgba(16,185,129,0.8)" }}
        >
          © {new Date().getFullYear()} nmProfessor.
          <br />
          All rights reserved.
        </p>
      </footer>
    </main>
  );
}

// Magnetic Effect
const MagneticEffect = ({ children, strength = 20 }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    setPos({
      x: clientX - (left + width / 2),
      y: clientY - (top + height / 2),
    });
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

// Divider
const Divider = () => (
  <div className="h-1 w-32 mx-auto mb-12 bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
);
