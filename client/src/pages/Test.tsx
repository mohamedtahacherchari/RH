import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export default function App(): JSX.Element {
  // Références vers les deux boîtes DOM
  const boxEffect = useRef<HTMLDivElement>(null);
  const boxLayout = useRef<HTMLDivElement>(null);

  // État pour déclencher l'animation
  const [trigger, setTrigger] = useState(false);

  // Déplacement de la boîte rouge avec useEffect (asynchrone, après paint)
  useEffect(() => {
    console.log("⏳ useEffect exécuté");
    if (trigger && boxEffect.current) {
      boxEffect.current.style.transform = 'translateX(100px)';
    }
  }, [trigger]);

  // Déplacement de la boîte verte avec useLayoutEffect (synchrone, avant paint)
  useLayoutEffect(() => {
    console.log("✅ useLayoutEffect exécuté");
    if (trigger && boxLayout.current) {
      boxLayout.current.style.transform = 'translateX(100px)';
    }
  }, [trigger]);

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => setTrigger(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-xl"
      >
        Déplacer les boîtes
      </button>

      <div className="space-y-4">
        {/* Boîte rouge (useEffect) */}
        <div
          ref={boxEffect}
          className="w-24 h-24 bg-red-400 transition-transform duration-500"
        >
          useEffect
        </div>

        {/* Boîte verte (useLayoutEffect) */}
        <div
          ref={boxLayout}
          className="w-24 h-24 bg-green-400 transition-transform duration-500"
        >
          useLayoutEffect
        </div>
      </div>
    </div>
  );
}
