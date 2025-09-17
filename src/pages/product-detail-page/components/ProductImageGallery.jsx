import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ProductImageGallery = ({ images, productName }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Handle case when no images are available
  if (!images || images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          <div className="text-center">
            <Icon name="ImageOff" size={48} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground font-medium">No image found</p>
            <p className="text-sm text-muted-foreground/70">Image not available for this product</p>
          </div>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? images?.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => 
      prev === images?.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
        <Image
          src={images?.[selectedImageIndex]}
          alt={`${productName} - Image ${selectedImageIndex + 1}`}
          className={`w-full h-full object-cover transition-transform duration-300 cursor-zoom-in ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />
        
        {/* Navigation Arrows */}
        {images?.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-background rounded-full flex items-center justify-center shadow-warm transition-colors duration-200"
              aria-label="Previous image"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-background/80 hover:bg-background rounded-full flex items-center justify-center shadow-warm transition-colors duration-200"
              aria-label="Next image"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </>
        )}

        {/* Zoom Indicator */}
        <div className="absolute top-2 right-2 bg-background/80 rounded-full p-2">
          <Icon name="ZoomIn" size={16} className="text-muted-foreground" />
        </div>
      </div>
      {/* Thumbnail Navigation */}
      {images?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images?.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                index === selectedImageIndex
                  ? 'border-primary' :'border-border hover:border-primary/50'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;