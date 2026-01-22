import React, { useState, useEffect, useRef } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  heightClass?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  alt, 
  className = "", 
  heightClass = "h-full"
}) => {
  // If no images, render nothing
  if (!images || images.length === 0) return null;

  // If only 1 image, render simple static version
  if (images.length === 1) {
    return (
      <div className={`relative w-full overflow-hidden ${heightClass} ${className}`}>
        <div className="w-full h-full relative">
           <img 
             src={images[0]} 
             alt={`${alt} 1`} 
             className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none"></div>
        </div>
      </div>
    );
  }

  // Extended images for infinite loop: [Last, ...Originals, First]
  const extendedImages = [images[images.length - 1], ...images, images[0]];
  
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // To block rapid clicks

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Reset when images change
  useEffect(() => {
    setCurrentIndex(1);
    setIsTransitioning(false);
    setIsAnimating(false);
  }, [images]);

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isAnimating) return;

    setIsTransitioning(true);
    setIsAnimating(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isAnimating) return;

    setIsTransitioning(true);
    setIsAnimating(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const goToSlide = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isAnimating) return;

    setIsTransitioning(true);
    setIsAnimating(true);
    setCurrentIndex(index + 1); // Adjust for offset
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const handleTransitionEnd = () => {
    setIsAnimating(false);

    // Teleport if at ends
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(images.length);
    } else if (currentIndex === extendedImages.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    }
  };

  // Calculate the active dot index (0-based)
  // If currentIndex is 0 (Clone Last) -> images.length - 1
  // If currentIndex is length+1 (Clone First) -> 0
  // Else -> currentIndex - 1
  let dotIndex = currentIndex - 1;
  if (currentIndex === 0) dotIndex = images.length - 1;
  if (currentIndex === extendedImages.length - 1) dotIndex = 0;

  return (
    <div 
      className={`relative w-full overflow-hidden group ${heightClass} ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Images Track */}
      <div 
        className="flex h-full"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 500ms ease-out' : 'none'
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedImages.map((img, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
             <img 
               src={img} 
               alt={`${alt} ${index}`} // Index is mostly internal here
               className="w-full h-full object-cover"
             />
             {/* Gradient Overlay */}
             <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-black/50 z-10"
        aria-label="Previous image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button 
        onClick={nextSlide}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-black/50 z-10"
        aria-label="Next image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => goToSlide(index, e)}
            className={`w-2 h-2 rounded-full transition-all ${
              dotIndex === index ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};