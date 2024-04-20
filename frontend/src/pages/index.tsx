//src/pages/index.tsx
import React, { useState } from 'react';
import Hero from "../components/Hero";
import Convincing from "../components/Convincing";
import CircularLoader from '@/components/CircularLoader';

export default function Home() {
  const [isVisible, setIsVisible] = useState(true); // State to control visibility

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      {isVisible && ( // Conditional rendering based on state
        <div className="flex flex-col items-center justify-center min-h-screen">
            <CircularLoader />
          <Hero onButtonClick={() => setIsVisible(false)} /> // Passing the function as a prop
          <div className="flex flex-col items-center justify-center min-h-screen -mt-32">
            <Convincing />
          </div>
        </div>
      )}
    </main>
  );
}