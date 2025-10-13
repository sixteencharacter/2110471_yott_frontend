import React from 'react';
import { Crown, BookOpen } from 'lucide-react';

// Medieval Loading Spinner
const MedievalLoadingSpinner = () => {
  return (
    <div className="relative w-16 h-16 md:w-20 md:h-20">
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
      
      {/* Outer rotating ring */}
      <div
        className="absolute inset-0 border-4 border-transparent border-t-purple-400 border-r-purple-300 rounded-full"
        style={{ animation: 'spin-slow 3s linear infinite' }}
      />
      
      {/* Middle rotating ring (opposite direction) */}
      <div
        className="absolute inset-2 border-3 border-transparent border-b-purple-500 border-l-purple-400 rounded-full"
        style={{ animation: 'spin-slow 4s linear infinite reverse' }}
      />
      
      {/* Inner pulsing circle */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
      >
        <Crown className="w-6 h-6 md:w-8 md:h-8 text-amber-400" />
      </div>
    </div>
  );
};

// Main Loading Component
export const YOTTLoading = ({ show = true, message = "Transmuting thy words..." }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none w-full min-h-screen"
      style={{
        opacity: show ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: show ? 'auto' : 'none',
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      {/* Background animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-purple-900/80 to-indigo-950/80" />
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-6 md:space-y-8" style={{
        transform: show ? 'scale(1)' : 'scale(0.8)',
        transition: 'transform 0.3s ease-out',
      }}>
        {/* Loading Spinner */}
        <MedievalLoadingSpinner />
        
        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-purple-100">
            {message}
          </h2>
          <p className="text-sm md:text-base text-purple-300 font-serif italic">
            ~ Patience, dear traveler ~
          </p>
        </div>
        
        {/* Decorative dots animation */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400"
              style={{
                animation: `pulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-10 left-10 text-purple-400 opacity-30 text-4xl">❖</div>
      <div className="absolute top-10 right-10 text-purple-400 opacity-30 text-4xl">❖</div>
      <div className="absolute bottom-10 left-10 text-purple-400 opacity-30 text-4xl">❖</div>
      <div className="absolute bottom-10 right-10 text-purple-400 opacity-30 text-4xl">❖</div>
    </div>
  );
};

// Loading with Progress Bar
export const YOTTLoadingWithProgress = ({ 
  show = true, 
  progress = 0, 
  message = "Transmuting thy words..." 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" style={{
      opacity: show ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
      pointerEvents: show ? 'auto' : 'none',
    }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="relative z-10 text-center space-y-6 md:space-y-8 w-96 max-w-xs md:max-w-md" style={{
        transform: show ? 'scale(1)' : 'scale(0.8)',
        transition: 'transform 0.3s ease-out',
      }}>
        {/* Loading Spinner */}
        <MedievalLoadingSpinner />
        
        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-purple-100">
            {message}
          </h2>
          <p className="text-sm text-purple-300 font-serif">
            {progress}%
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-purple-900/50 border border-purple-500/30 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-amber-400 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Footer */}
        <p className="text-xs md:text-sm text-purple-300 font-serif italic">
          ~ The ancient magic works in mysterious ways ~
        </p>
      </div>
      
      {/* Corner decorations */}
      <div className="absolute top-10 left-10 text-purple-400 opacity-30 text-4xl">❖</div>
      <div className="absolute top-10 right-10 text-purple-400 opacity-30 text-4xl">❖</div>
      <div className="absolute bottom-10 left-10 text-purple-400 opacity-30 text-4xl">❖</div>
      <div className="absolute bottom-10 right-10 text-purple-400 opacity-30 text-4xl">❖</div>
    </div>
  );
};