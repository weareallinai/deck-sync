'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import type { Slide, Element as SlideElement } from '@deck/shared';
import { getTransitionConfig } from '@/lib/render/transitions';
import { VideoPlayer } from './VideoPlayer';

// GUARDRAIL: Use only transform/opacity (GPU accelerated)

interface SlideRendererProps {
  slide: Slide | null;
  step: number;
  onVideoEnd?: () => void;
}

export function SlideRenderer({ slide, step, onVideoEnd }: SlideRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // Calculate scale to fit 1280x720 content into container
        const scaleX = width / 1280;
        const scaleY = height / 720;
        const newScale = Math.min(scaleX, scaleY);
        
        setScale(newScale);
        
        // Calculate centering offset
        const scaledWidth = 1280 * newScale;
        const scaledHeight = 720 * newScale;
        setOffset({
          left: (width - scaledWidth) / 2,
          top: (height - scaledHeight) / 2,
        });
      }
    };

    // Delay initial scale calculation to ensure container is rendered
    const timeout = setTimeout(updateScale, 100);
    
    window.addEventListener('resize', updateScale);
    
    // Use ResizeObserver for better iframe support
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateScale);
      resizeObserver.disconnect();
    };
  }, []);
  
  if (!slide) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <p className="text-white text-2xl">Waiting for slides...</p>
      </div>
    );
  }

  // Get transition config
  const transitionConfig = getTransitionConfig(slide.transition);

  // Filter elements visible at current step
  const visibleElements = slide.elements.filter((el, index) => {
    // Simple step-based visibility: show elements up to current step
    return index <= step;
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={containerRef}
        key={slide.id}
        className="w-full h-full relative overflow-hidden"
        style={{
          background: slide.bg.type === 'color' ? slide.bg.value :
                     slide.bg.type === 'gradient' ? slide.bg.value :
                     `url(${slide.bg.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        initial={transitionConfig.initial}
        animate={transitionConfig.animate}
        exit={transitionConfig.exit}
        transition={transitionConfig.transition}
      >
        {/* Inner container at fixed 1280x720 that scales down */}
        <div 
          className="absolute"
          style={{
            width: '1280px',
            height: '720px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            left: `${offset.left}px`,
            top: `${offset.top}px`,
          }}
        >
          {/* Render elements */}
          {visibleElements.map((element, index) => (
            <ElementRenderer
              key={element.id}
              element={element}
              index={index}
              step={step}
              onVideoEnd={onVideoEnd}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ElementRendererProps {
  element: SlideElement;
  index: number;
  step: number;
  onVideoEnd?: () => void;
}

function ElementRenderer({ element, index, step, onVideoEnd }: ElementRendererProps) {
  // Determine if this element should be visible based on step
  const isVisible = index <= step;

  // Get animations for this element
  const animations = element.animations || [];
  
  // Find animations that should trigger based on current state
  const onLoadAnimations = animations.filter(a => a.trigger === 'on-load');
  const onStepAnimations = animations.filter(a => a.trigger === 'on-step');
  
  // Use the first animation for this element (can be enhanced to chain multiple)
  const activeAnimation = isVisible && onStepAnimations.length > 0 
    ? onStepAnimations[0] 
    : onLoadAnimations.length > 0 
    ? onLoadAnimations[0] 
    : null;

  // Build animation configuration based on animation type
  const getAnimationConfig = (anim: typeof activeAnimation) => {
    if (!anim) {
      // Default simple fade-in
      return {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 },
        transition: { duration: 0.3, delay: index * 0.1 },
      };
    }

    const base = { opacity: isVisible ? 1 : 0 };
    const initial = { opacity: 0 };
    
    switch (anim.type) {
      case 'fade':
        return {
          initial,
          animate: base,
          transition: { duration: anim.duration, delay: anim.delay, ease: anim.easing || 'ease-out' },
        };
      case 'slide-up':
        return {
          initial: { ...initial, y: 50 },
          animate: { ...base, y: 0 },
          transition: { duration: anim.duration, delay: anim.delay, ease: anim.easing || 'ease-out' },
        };
      case 'slide-down':
        return {
          initial: { ...initial, y: -50 },
          animate: { ...base, y: 0 },
          transition: { duration: anim.duration, delay: anim.delay, ease: anim.easing || 'ease-out' },
        };
      case 'slide-left':
        return {
          initial: { ...initial, x: 50 },
          animate: { ...base, x: 0 },
          transition: { duration: anim.duration, delay: anim.delay, ease: anim.easing || 'ease-out' },
        };
      case 'slide-right':
        return {
          initial: { ...initial, x: -50 },
          animate: { ...base, x: 0 },
          transition: { duration: anim.duration, delay: anim.delay, ease: anim.easing || 'ease-out' },
        };
      case 'zoom':
        return {
          initial: { ...initial, scale: 0.5 },
          animate: { ...base, scale: 1 },
          transition: { duration: anim.duration, delay: anim.delay, ease: anim.easing || 'ease-out' },
        };
      case 'bounce':
        return {
          initial: { ...initial, y: -30 },
          animate: { ...base, y: 0 },
          transition: { 
            duration: anim.duration, 
            delay: anim.delay, 
            ease: [0.68, -0.55, 0.27, 1.55], // Bounce easing
          },
        };
      default:
        return {
          initial,
          animate: base,
          transition: { duration: anim.duration, delay: anim.delay, ease: anim.easing || 'ease-out' },
        };
    }
  };

  const animationProps = getAnimationConfig(activeAnimation);

  const style = {
    position: 'absolute' as const,
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.w}px`,
    height: `${element.h}px`,
    zIndex: element.z,
  };

  switch (element.type) {
    case 'text':
      return (
        <motion.div
          {...animationProps}
          style={{
            ...style,
            ...element.style,
            fontFamily: element.style.fontFamily || 'Arial',
            color: element.style.color || '#000',
            fontSize: `${element.style.fontSize || 24}px`,
            fontWeight: element.style.fontWeight || 400,
            textAlign: element.style.align || 'left',
          }}
        >
          {element.content}
        </motion.div>
      );

    case 'shape':
      return (
        <motion.div
          {...animationProps}
          style={{
            ...style,
            backgroundColor: element.fill || 'transparent',
            border: element.stroke
              ? `${element.stroke.width}px solid ${element.stroke.color}`
              : 'none',
            borderRadius: element.shape === 'ellipse' ? '50%' : '0',
          }}
        />
      );

    case 'image':
      return (
        <motion.img
          {...animationProps}
          src={element.src}
          alt={element.alt || ''}
          style={{
            ...style,
            objectFit: 'contain',
          }}
        />
      );

    case 'video':
      return (
        <motion.div
          {...animationProps}
          style={{
            ...style,
            overflow: 'hidden',
          }}
        >
          <VideoPlayer
            element={element}
            isVisible={isVisible}
            onVideoEnd={onVideoEnd}
          />
        </motion.div>
      );

    default:
      return null;
  }
}

