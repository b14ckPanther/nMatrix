import { useEffect } from 'react';

export default function ARSpaceComponent() {
  useEffect(() => {
    // Here we would initialize the AR components...
    console.log('AR Space experience initialized.');
  }, []);

  return (
    <div className='ar-space-container text-center'>
      <h1 className='text-5xl font-bold neon-text mb-4'>Explore the Universe</h1>
      <p className='text-xl text-gray-300'>Dive into an immersive space adventure using AR technology.</p>
    </div>
  );
}
