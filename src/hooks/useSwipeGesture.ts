"use client";

import { useEffect, useRef } from 'react';

interface UseSwipeGestureProps {
  onSwipeFromRight: () => void;
  enabled?: boolean;
}

export function useSwipeGesture({ onSwipeFromRight, enabled = true }: UseSwipeGestureProps) {
  const startX = useRef(0);
  const startY = useRef(0);
  const endX = useRef(0);
  const endY = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    // Temporary keyboard shortcut for testing (press 'D' key)
    // const handleKeyPress = (e: KeyboardEvent) => {
    //   if (e.key === 'd' || e.key === 'D') {
    //     console.log('Test key pressed - opening drawer');
    //     onSwipeFromRight();
    //   }
    // };

    // Touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      endX.current = e.changedTouches[0].clientX;
      endY.current = e.changedTouches[0].clientY;
      handleSwipe();
    };

    // Mouse events for desktop/trackpad
    const handleMouseDown = (e: MouseEvent) => {
      // Only start tracking if mouse down is near the right edge (within 20px)
      if (window.innerWidth - e.clientX <= 20) {
        startX.current = e.clientX;
        startY.current = e.clientY;
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
          endX.current = moveEvent.clientX;
          endY.current = moveEvent.clientY;
        };

        const handleMouseUp = () => {
          handleSwipe();
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    };

    // Trackpad wheel events for 2-finger swipes
    const handleWheel = (e: WheelEvent) => {
      // Debug logging
      console.log('Wheel event:', {
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        clientX: e.clientX,
        windowWidth: window.innerWidth,
        isFromRight: e.clientX > window.innerWidth - 200
      });

      // Check if it's a horizontal trackpad swipe
      const isHorizontalSwipe = Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10;
      const isSwipeLeft = e.deltaX > 20; // Positive deltaX means swipe left
      
      
      if (isHorizontalSwipe && isSwipeLeft) {
        console.log('Trackpad swipe detected! Opening drawer...');
        e.preventDefault();
        onSwipeFromRight();
      }
    };

    const handleSwipe = () => {
      const deltaX = endX.current - startX.current;
      const deltaY = endY.current - startY.current;
      const minSwipeDistance = 100;
      const maxVerticalDrift = 100;

      // Check if it's a valid swipe from right edge
      const isNearRightEdge = startX.current > window.innerWidth - 50; // Within 50px of right edge
      const isLeftSwipe = deltaX < -minSwipeDistance;
      const isNotTooVertical = Math.abs(deltaY) < maxVerticalDrift;

      if (isNearRightEdge && isLeftSwipe && isNotTooVertical) {
        onSwipeFromRight();
      }
    };

    // Pointer events for better trackpad support
    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && window.innerWidth - e.clientX <= 50) {
        startX.current = e.clientX;
        startY.current = e.clientY;
        
        const handlePointerMove = (moveEvent: PointerEvent) => {
          endX.current = moveEvent.clientX;
          endY.current = moveEvent.clientY;
        };

        const handlePointerUp = () => {
          handleSwipe();
          document.removeEventListener('pointermove', handlePointerMove);
          document.removeEventListener('pointerup', handlePointerUp);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
      }
    };

    // Add event listeners
    //document.addEventListener('keypress', handleKeyPress);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      //document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [onSwipeFromRight, enabled]);
}