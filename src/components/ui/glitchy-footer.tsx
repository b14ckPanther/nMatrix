'use client';

import { useEffect, useState } from 'react';

export function GlitchyFooter() {
  const [glitch, setGlitch] = useState(false);
  const [glitchText, setGlitchText] = useState('');

  useEffect(() => {
    // Random glitch effect every 3-8 seconds
    const glitchInterval = setInterval(() => {
      // Create random glitch text variations
      const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?~`';
      const original = `© ${new Date().getFullYear()} by nmProfessor | All Rights Reserved`;
      const glitched = original
        .split('')
        .map((char) => {
          if (char === ' ') return ' ';
          if (Math.random() < 0.1) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          }
          return char;
        })
        .join('');
      
      setGlitchText(glitched);
      setGlitch(true);
      
      setTimeout(() => {
        setGlitch(false);
        setGlitchText('');
      }, 200);
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  const year = new Date().getFullYear();
  const displayText = glitch ? glitchText : `© ${year} by nmProfessor | All Rights Reserved`;

  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            nmMatrix - A living, evolving digital organism
          </p>
          <div className="relative inline-block">
            <p
              className={`text-sm font-mono tracking-wider transition-all duration-200 ${
                glitch
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              style={{
                textShadow: glitch
                  ? `
                    2px 0 #ff0080, 
                    -2px 0 #00ffff, 
                    0 2px #00ff00, 
                    0 -2px #ffff00,
                    3px 3px 6px rgba(255, 0, 128, 0.5),
                    -3px -3px 6px rgba(0, 255, 255, 0.5)
                  `
                  : 'none',
                transform: glitch
                  ? `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px) skew(${Math.random() * 10 - 5}deg)`
                  : 'translate(0, 0) skew(0deg)',
                filter: glitch ? 'blur(0.5px)' : 'blur(0)',
              }}
            >
              {displayText}
            </p>
            {glitch && (
              <>
                <p
                  className="absolute inset-0 text-sm font-mono tracking-wider text-pink-600 pointer-events-none opacity-70"
                  style={{
                    transform: `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`,
                    clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
                    filter: 'blur(1px)',
                  }}
                  aria-hidden="true"
                >
                  {displayText}
                </p>
                <p
                  className="absolute inset-0 text-sm font-mono tracking-wider text-cyan-500 pointer-events-none opacity-70"
                  style={{
                    transform: `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`,
                    clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
                    filter: 'blur(1px)',
                  }}
                  aria-hidden="true"
                >
                  {displayText}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

