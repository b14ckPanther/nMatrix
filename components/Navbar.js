"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { AlignJustify, X } from "lucide-react";

const navLinks = [
  { href: "#features", text: "Features" },
  { href: "#about", text: "About" },
  { href: "#contact", text: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Detect scroll to add a background to the navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Close mobile menu if window is resized to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
  <motion.nav
  className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
    scrolled || isMenuOpen
      ? "bg-black/80 backdrop-blur-md shadow-lg border-b border-emerald-500/20 pulse-glow"
      : "bg-transparent"
  }`}
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  transition={{ duration: 0.5, ease: "circOut" }}
>

        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <MagneticEffect strength={30}>
            {/* LOGO */}
        <a href="#hero" className="flex items-center group">
  <span 
    className="hidden sm:inline-block bg-gradient-to-br from-green-400 to-cyan-500 bg-clip-text text-transparent transition-transform duration-300 ease-in-out group-hover:scale-110 font-logo text-4xl"
  >
    nMatrix
  </span>
</a>

          </MagneticEffect>

          {/* Desktop Links */}
          <DesktopNav />

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <MagneticEffect strength={40}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2 rounded-full transition-colors hover:bg-white/10"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isMenuOpen ? "x" : "menu"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMenuOpen ? <X size={24} /> : <AlignJustify size={24} />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </MagneticEffect>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <MobileNav isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
    </>
  );
}

// Desktop Navigation Component
const DesktopNav = () => {
  const [hoveredLink, setHoveredLink] = useState(null);
  
  return (
    <div 
      onMouseLeave={() => setHoveredLink(null)}
      className="hidden md:flex gap-6 items-center relative"
    >
      {navLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onMouseEnter={() => setHoveredLink(link.href)}
          className="relative px-3 py-2 font-medium text-gray-300 transition-all hover:scale-105 hover:text-white scroll-smooth"
        >
          <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent">
            {link.text}
          </span>
  {hoveredLink === link.href && (
<motion.div
  layoutId="underline"
  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-400 rounded-full underline-pulse"
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
  />
)}


        </a>
      ))}
    </div>
  );
};

// Mobile Navigation Component
const MobileNav = ({ isOpen, setIsOpen }) => {
  const mobileNavVariants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: { y: "0%", opacity: 1, transition: { duration: 0.4, ease: "circOut" }},
    exit: { y: "-100%", opacity: 0, transition: { duration: 0.3, ease: "circIn" }},
  };

  const linkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 + 0.2, ease: "easeOut" },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={mobileNavVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-black/95 z-40 md:hidden flex flex-col items-center justify-center"
        >
          <div className="flex flex-col gap-8 text-center">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                variants={linkVariants}
                custom={i}
                onClick={() => setIsOpen(false)}
                className="text-3xl font-semibold bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent transition-transform hover:scale-110"
              >
                {link.text}
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Magnetic Effect Component
const MagneticEffect = ({ children, strength = 20 }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x, y });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x * (strength / 100), y: position.y * (strength / 100) }}
      transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
    >
      {children}
    </motion.div>
  );
};
