'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { normalizeImagePath } from '@/lib/image-utils';

interface Casino {
  id: string;
  name: string;
  slug: string;
  logo: string;
  affiliateLink: string;
  rating: number;
  codeTermLabel?: string;
  bonus: {
    id: string;
    title: string;
    code: string | null;
    type: string;
    value: string;
    description: string;
  } | null;
}

interface SpinWheelProps {
  casinos: Casino[];
  faviconUrl: string;
}

export default function SpinWheel({ casinos, faviconUrl }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCasino, setSelectedCasino] = useState<Casino | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [openedWindow, setOpenedWindow] = useState<Window | null>(null);
  const [currentSpinCleanup, setCurrentSpinCleanup] = useState<(() => void) | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const spinSoundRef = useRef<HTMLAudioElement>(null);
  const landSoundRef = useRef<HTMLAudioElement>(null);

  // Calculate segment size and colors
  const segmentAngle = 360 / casinos.length;
  const colors = ['#68D08B', '#3e4050', '#5abc7a', '#2c2f3a', '#7ee3a8', '#343541'];

  // Web Audio API fallback for sounds
  const playBeep = (frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      // Fallback silently fails
    }
  };

  // Distinctive landing sound
  const playLandingSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 880; // Higher pitch for more distinctive sound
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Fallback silently fails
    }
  };

  // Ticking sound for spinning wheel with realistic slowdown
  const playSpinningSound = () => {
    try {
      const playTick = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // Higher pitch for tick sound
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05); // Very short tick
      };
      
      let currentInterval = 120; // Start at 120ms
      let tickTimeouts: NodeJS.Timeout[] = [];
      
      const scheduleTick = (delay: number) => {
        const timeout = setTimeout(() => {
          playTick();
          
          // Gradually increase interval to slow down
          currentInterval += 8; // Increase by 8ms each tick for gradual slowdown
          
          // Continue ticking if we haven't reached the end
          if (currentInterval < 400) { // Stop when interval gets too long
            scheduleTick(currentInterval);
          }
        }, delay);
        
        tickTimeouts.push(timeout);
      };
      
      // Initial tick
      playTick();
      
      // Start the slowdown sequence
      scheduleTick(currentInterval);
      
      // Return cleanup function
      return () => {
        tickTimeouts.forEach(timeout => clearTimeout(timeout));
        tickTimeouts = [];
      };
    } catch (error) {
      return null;
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    
    // Play ticking sound while spinning
    const spinCleanup = playSpinningSound();
    setCurrentSpinCleanup(spinCleanup);
    
    // More realistic wheel spin: 5-8 full rotations with randomness
    const minRotations = 5;
    const maxRotations = 8;
    const randomRotations = Math.random() * (maxRotations - minRotations) + minRotations;
    const randomPosition = Math.random() * 360;
    const totalRotation = randomRotations * 360 + randomPosition;
    
    // Calculate which casino we land on
    const normalizedPosition = (360 - (totalRotation % 360)) % 360;
    const selectedIndex = Math.floor(normalizedPosition / segmentAngle);
    const selectedCasinoData = casinos[selectedIndex];

    if (wheelRef.current) {
      // Updated transition for realistic deceleration
      wheelRef.current.style.transition = 'transform 6s cubic-bezier(0.15, 0, 0.25, 1)';
      wheelRef.current.style.transform = `rotate(${totalRotation}deg)`;
    }

    // Show result after animation completes (6 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      
      // Stop ticking sound
      if (currentSpinCleanup) {
        currentSpinCleanup();
        setCurrentSpinCleanup(null);
      }
      
      // Small delay to ensure ticking has stopped, then play landing sound
      setTimeout(() => {
        console.log('Playing landing sound');
        playLandingSound();
      }, 100);
      
      setSelectedCasino(selectedCasinoData);
      setShowModal(true);
    }, 6000); // Increased to 6 seconds
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCasino(null);
    setOpenedWindow(null);
    
    // Clean up any remaining sound cleanup functions
    if (currentSpinCleanup) {
      currentSpinCleanup();
      setCurrentSpinCleanup(null);
    }
    
    // Reset wheel rotation
    if (wheelRef.current) {
      wheelRef.current.style.transform = 'rotate(0deg)';
      wheelRef.current.style.transition = 'none';
      
      // Re-enable transition after a brief moment with the new timing
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'transform 6s cubic-bezier(0.15, 0, 0.25, 1)';
        }
      }, 50);
    }
  };

  const handleClaimBonus = () => {
    if (selectedCasino?.affiliateLink) {
      window.open(selectedCasino.affiliateLink, '_blank', 'noopener,noreferrer');
    }
    closeModal();
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Wheel Container */}
      <div className="relative">
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="relative w-80 h-80 sm:w-96 sm:h-96 border-4 border-white shadow-2xl bg-[#343541] overflow-hidden"
          style={{ 
            transition: 'transform 6s cubic-bezier(0.15, 0, 0.25, 1)',
            transformOrigin: 'center',
            borderRadius: '50%'
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 200"
            className="absolute inset-0"
            style={{ 
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            {casinos.map((casino, index) => {
              const colorIndex = index % colors.length;
              const startAngle = (index * segmentAngle) - 90; // Rotate to start at top
              const endAngle = ((index + 1) * segmentAngle) - 90;
              
              const startAngleRad = (startAngle * Math.PI) / 180;
              const endAngleRad = (endAngle * Math.PI) / 180;
              
              const x1 = 100 + 100 * Math.cos(startAngleRad);
              const y1 = 100 + 100 * Math.sin(startAngleRad);
              const x2 = 100 + 100 * Math.cos(endAngleRad);
              const y2 = 100 + 100 * Math.sin(endAngleRad);
              
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              
              return (
                <path
                  key={casino.id}
                  d={pathData}
                  fill={colors[colorIndex]}
                  stroke="none"
                />
              );
            })}
          </svg>
        </div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
        </div>

        {/* Center Hub */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#68D08B] rounded-full shadow-lg flex items-center justify-center z-20 cursor-pointer hover:scale-105 transition-transform border-2 border-white"
          onClick={spinWheel}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
            <Image
              src={`/favicon-32x32.png?v=${Date.now()}`}
              alt="CryptoBonuses"
              width={36}
              height={36}
              className="object-contain w-9 h-9"
              unoptimized
            />
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showModal && selectedCasino && (
        <div 
          className="fixed bg-black/50 flex items-center justify-center p-4" 
          style={{ 
            position: 'fixed', 
            top: '-100px', 
            left: '-100px', 
            right: '-100px', 
            bottom: '-100px', 
            width: 'calc(100vw + 200px)', 
            height: 'calc(100vh + 200px)', 
            zIndex: 999999,
            margin: 0,
            padding: '100px'
          }}
        >
          <div className="bg-[#3e4050] rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl relative" style={{ zIndex: 1000000 }}>
            <div className="text-center space-y-4">
              {/* Casino Logo */}
              <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden bg-white/10">
                <Image
                  src={normalizeImagePath(selectedCasino.logo)}
                  alt={selectedCasino.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Casino Name */}
              <h2 className="text-2xl font-bold text-white">
                🎉 You landed on {selectedCasino.name}!
              </h2>
              
              {/* Bonus Details */}
              {selectedCasino.bonus ? (
                <div className="bg-[#343541] rounded-lg p-4 space-y-3">
                  <h3 className="text-lg font-semibold text-[#68D08B]">
                    {selectedCasino.bonus.title}
                  </h3>
                  
                  {selectedCasino.bonus.code && (
                    <div className="bg-[#68D08B]/10 border border-[#68D08B]/30 rounded-lg p-3">
                      <p className="text-white/80 text-sm mb-1">{selectedCasino.codeTermLabel || 'Bonus Code'}:</p>
                      <p className="text-[#68D08B] font-bold text-lg">
                        {selectedCasino.bonus.code}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-white/80 text-sm">
                      <span className="font-semibold">Type:</span> {selectedCasino.bonus.type.replace('_', ' ')}
                    </p>
                    <p className="text-white/80 text-sm">
                      <span className="font-semibold">Value:</span> {selectedCasino.bonus.value}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#343541] rounded-lg p-4">
                  <p className="text-white/80">
                    Exciting offers available at {selectedCasino.name}!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    closeModal();
                    // Reload page to ensure subsequent spins work properly
                    setTimeout(() => window.location.reload(), 100);
                  }}
                  className="flex-1 px-4 py-3 bg-[#404055] hover:bg-[#4a4d61] text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Spin Again
                </button>
                <button
                  onClick={handleClaimBonus}
                  className="flex-1 px-4 py-3 bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] font-bold rounded-lg transition-colors duration-300"
                >
                  Visit Casino
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spin Button */}
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className={`px-12 py-4 text-xl font-bold rounded-xl transition-all duration-300 border-2 ${
          isSpinning 
            ? 'bg-gray-500 text-gray-300 cursor-not-allowed border-gray-500' 
            : 'bg-[#68D08B] hover:bg-[#5abc7a] text-[#343541] border-[#68D08B] hover:border-[#5abc7a] transform hover:scale-105'
        }`}
      >
        {isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL!'}
      </button>

      {/* Audio Elements */}
      <audio ref={spinSoundRef} preload="auto">
        <source src="/sounds/spin.mp3" type="audio/mpeg" />
        <source src="/sounds/spin.wav" type="audio/wav" />
      </audio>
      <audio ref={landSoundRef} preload="auto">
        <source src="/sounds/land.mp3" type="audio/mpeg" />
        <source src="/sounds/land.wav" type="audio/wav" />
      </audio>
    </div>
  );
} 