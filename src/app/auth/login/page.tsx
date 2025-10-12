"use client"

import React, { useState, useEffect } from 'react';
import { Scroll, Sparkles, Crown, PenTool, BookOpen } from 'lucide-react';
import { signIn } from 'next-auth/react';
// Typing Animation Component
const TypingAnimation = ({ texts, speed = 50 } : {texts : String[] , speed : number}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    
    if (!isDeleting && index < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + currentText[index]);
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (isDeleting && index > 0) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev.slice(0, -1));
        setIndex(index - 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (!isDeleting && index === currentText.length) {
      const timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (isDeleting && index === 0) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }
  }, [index, textIndex, isDeleting, texts, speed]);

  return (
    <div className="text-lg md:text-2xl lg:text-3xl font-serif text-purple-100 min-h-20 md:min-h-28 flex items-center justify-center px-2">
      <span className="leading-relaxed">{displayedText}</span>
      <span className="animate-pulse text-purple-300 ml-1">|</span>
    </div>
  );
};

// Floating Parchment Particles
const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 3,
    size: 3 + Math.random() * 8,
    opacity: 0.1 + Math.random() * 0.15,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute bg-amber-200 rounded-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            bottom: '-10px',
            opacity: particle.opacity,
            animation: `float ${particle.duration}s infinite ease-in-out`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${Math.random() * 45}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.12;
          }
          90% {
            opacity: 0.12;
          }
          100% {
            transform: translateY(-100vh) translateX(150px) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Animated Background with Parchment Texture
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950" />
      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/30 via-transparent to-purple-900/20" />
      
      {/* Parchment paper texture overlay */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(217, 119, 6, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(217, 119, 6, 0.08) 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='100' height='100' fill='%23f5deb3' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* <FloatingParticles /> */}
    </div>
  );
};

// Crown Animation Component with Glow
const AnimatedCrown = () => {
  return (
    <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto mb-4 md:mb-8">
      <style>{`
        @keyframes crownGlow {
          0%, 100% { 
            filter: drop-shadow(0 0 15px rgba(217, 119, 6, 0.5)) drop-shadow(0 0 30px rgba(139, 69, 19, 0.3));
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 40px rgba(217, 119, 6, 0.8)) drop-shadow(0 0 60px rgba(139, 69, 19, 0.5));
            transform: scale(1.08);
          }
        }
        @keyframes crownShine {
          0%, 100% { opacity: 0; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div className="absolute inset-0" style={{ animation: 'crownGlow 4s ease-in-out infinite' }}>
        <Crown className="w-full h-full text-amber-600" />
      </div>
      <div
        className="absolute inset-0"
        style={{
          animation: 'crownShine 3s ease-in-out infinite',
        }}
      >
        <Crown className="w-full h-full text-amber-400 opacity-50" />
      </div>
    </div>
  );
};

// Glow Effect on Text
const GlowText = ({ children, className = '' } : {children : string , className? : string}) => {
  return (
    <span
      className={`${className} relative`}
      style={{
        textShadow: '0 0 20px rgba(217, 119, 6, 0.6), 0 0 40px rgba(180, 83, 9, 0.4)',
      }}
    >
      {children}
    </span>
  );
};

// Parchment Box Component
const ParchmentBox = ({ children } : {children : React.ReactNode}) => {
  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Glowing border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-purple-400/20 to-purple-500/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 backdrop-blur-md border-2 border-purple-500/30 rounded-lg p-6 md:p-8 lg:p-10">
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 border-t-2 border-l-2 border-purple-400/40 rounded-tl-md" />
        <div className="absolute top-2 right-2 w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 border-t-2 border-r-2 border-purple-400/40 rounded-tr-md" />
        <div className="absolute bottom-2 left-2 w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 border-b-2 border-l-2 border-purple-400/40 rounded-bl-md" />
        <div className="absolute bottom-2 right-2 w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 border-b-2 border-r-2 border-purple-400/40 rounded-br-md" />
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

// Login Button Component
const LoginButton = ({ onClick } : {onClick : () => void}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="relative px-6 md:px-8 py-3 md:py-4 font-serif text-base md:text-lg font-bold text-amber-950 bg-gradient-to-b from-amber-200 to-amber-300 rounded-sm transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden group border-2 border-amber-700/30"
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-amber-100 to-yellow-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        <Scroll className="w-5 h-5" />
        Commence Thy Journey
      </span>
      {isHovering && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <Sparkles
              key={i}
              className="w-4 h-4 text-amber-600 absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
};

// Decorative Line Component
const DecorativeLine = () => {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-70" />
      <PenTool className="w-5 h-5 text-purple-400 opacity-80" />
      <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-purple-400 to-transparent opacity-70" />
    </div>
  );
};

// Main Home Component
export default function YOTTHome() {

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-3xl px-4 md:px-6 lg:px-8 text-center space-y-6 md:space-y-8">
        {/* Crown Logo */}
        <AnimatedCrown />

        {/* Main Title with Medieval Flair */}
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
            <BookOpen className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-purple-300 opacity-80" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-purple-100 tracking-wider">
              <GlowText>YOTT</GlowText>
            </h1>
            <BookOpen className="w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 text-purple-300 opacity-80" />
          </div>
          <p className="text-base md:text-lg lg:text-xl text-purple-200 font-serif italic tracking-widest">
            Ye Olde Tongue Twister
          </p>
          <p className="text-xs md:text-sm lg:text-base text-purple-300 font-serif opacity-80 tracking-widest">
            ~ A Parchment of Transmutation ~
          </p>
        </div>

        {/* Decorative Line */}
        <DecorativeLine />

        {/* Typing Animation Description in Parchment Box */}
        <ParchmentBox>
          <div className="space-y-3">
            <TypingAnimation
              texts={[
                "Prithee, transformeth thy words into the tongue of olden times...",
                "Hark! Speak ye thy modern speech, and we shall enchant it...",
                "Behold! Give us thy text, and we shall weave ancient magic...",
                "Lo! Utter thy words, and witness their transformation most wondrous..."
              ]}
              speed={80}
            />
          </div>
        </ParchmentBox>

        {/* Feature Description */}
        <div className="space-y-2 md:space-y-3 text-purple-100">
          <p className="text-sm md:text-base lg:text-lg font-serif">
            Speak thy modern tongue, and we shall transmute it
          </p>
          <p className="text-xs md:text-sm lg:text-base font-serif italic opacity-90">
            into the eloquence of the Medieval Age
          </p>
        </div>

        {/* Login Button */}
        <div className="pt-4 md:pt-6">
          <LoginButton onClick={()=>{signIn("keycloak",{
            callbackUrl : '/'
          })}} />
        </div>

        {/* Footer Text */}
        <div className="pt-6 md:pt-8 text-purple-200 text-xs md:text-sm lg:text-base font-serif space-y-1 md:space-y-2">
          <p className="opacity-85">Hark! Enter thine credentials to commence this wondrous journey</p>
          <p className="text-xs opacity-70">⚔️ Protected by the ancient wards of Keycloak ⚔️</p>
        </div>
      </div>

      {/* Corner Decorations - Ornate */}
      <div className="fixed top-8 left-8 text-purple-400 opacity-50 text-5xl font-serif">❖</div>
      <div className="fixed top-8 right-8 text-purple-400 opacity-50 text-5xl font-serif">❖</div>
      <div className="fixed bottom-8 left-8 text-purple-400 opacity-50 text-5xl font-serif">❖</div>
      <div className="fixed bottom-8 right-8 text-purple-400 opacity-50 text-5xl font-serif">❖</div>

      {/* Subtle decorative scrolls */}
      <div className="fixed top-1/4 left-4 text-purple-500 opacity-30 text-6xl">⚜</div>
      <div className="fixed top-2/3 right-4 text-purple-500 opacity-30 text-6xl">⚜</div>
    </div>
  );
}