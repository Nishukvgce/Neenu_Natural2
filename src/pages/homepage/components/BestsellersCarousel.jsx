import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import productApi from '../../../services/productApi';
import dataService from '../../../services/dataService';
import apiClient from '../../../services/api';

const BestsellersCarousel = ({ onAddToCart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resolve image URL from backend (handles relative paths like "/admin/products/images/xxx.jpg")
  const resolveImageUrl = (input) => {
    let candidate = typeof input === 'string'
      ? input
      : (input?.imageUrl || input?.image || input?.thumbnailUrl);
    if (!candidate) return '/assets/images/no_image.png';
    if (typeof candidate !== 'string') return '/assets/images/no_image.png';
    // Absolute URLs or data URIs
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;

    // If it's an absolute OS path (Windows/Unix) or contains backslashes, extract filename
    if (/^[a-zA-Z]:\\/.test(candidate) || candidate.startsWith('\\\\') || candidate.startsWith('/') || candidate.includes('\\')) {
      const parts = candidate.split(/\\|\//);
      candidate = parts[parts.length - 1];
    }

    // If it's a bare filename, map to API image route
    if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
      candidate = `/admin/products/images/${candidate}`;
    }

    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  useEffect(() => {
    const loadBestsellers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching bestselling products...');
        
        let bestsellerProducts = [];
        
        // Try to get bestsellers from backend API
        try {
          const productsRes = await productApi.getAll();
          const allProducts = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
          
          // Filter for bestsellers or top-rated products
          bestsellerProducts = allProducts
            .filter(product => product.featured || product.bestseller || product.rating >= 4.5)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 8); // Limit to 8 bestsellers
            
          if (bestsellerProducts.length === 0) {
            // Fallback: Take top products by rating
            bestsellerProducts = allProducts
              .sort((a, b) => (b.rating || 0) - (a.rating || 0))
              .slice(0, 6);
          }
          
        } catch (apiError) {
          console.warn('Backend API failed, falling back to dataService:', apiError?.message);
          
          // Fallback to dataService
          const response = await dataService.getProducts();
          const products = response?.data || [];
          bestsellerProducts = products
            .filter(product => product.featured || product.bestseller || product.rating >= 4.5)
            .slice(0, 6);
        }
        
        // Normalize product data for consistent display
        const normalizedProducts = bestsellerProducts.map(product => ({
          id: product.id,
          name: product.name || product.title,
          originalPrice: product.originalPrice || product.price || 0,
          salePrice: product.salePrice || product.price || 0,
          price: product.price || product.salePrice || 0,
          image: resolveImageUrl(product),
          rating: product.rating || 4.5,
          reviewCount: product.reviewCount || product.reviews || Math.floor(Math.random() * 200) + 50,
          badges: product.badges || product.tags || ["Quality Product"],
          weight: product.weight || product.size || product.variant || "250g",
          inStock: product.inStock !== false,
          quickAdd: true,
          category: product.category || product.categoryId
        }));
        
        setBestsellers(normalizedProducts);
        console.log('Successfully loaded bestsellers:', normalizedProducts.length);
        
      } catch (err) {
        console.error('Error loading bestsellers:', err);
        setError('Failed to load bestselling products');
        setBestsellers([]);
      } finally {
        setLoading(false);
      }
    };

    loadBestsellers();
  }, []);

  const itemsPerSlide = {
    mobile: 2,
    tablet: 3,
    desktop: 4
  };

  const totalSlides = Math.max(1, Math.ceil(bestsellers?.length / itemsPerSlide?.desktop));

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const calculateSavings = (original, sale) => {
    if (!original || !sale || original <= sale) return 0;
    return Math.round(((original - sale) / original) * 100);
  };

  const handleQuickAdd = (product) => {
    if (onAddToCart) {
      onAddToCart({
        id: product?.id,
        name: product?.name,
        price: product?.price || product?.salePrice || 0,
        originalPrice: product?.originalPrice || product?.price || product?.salePrice || 0,
        image: product?.image,
        variant: product?.weight,
        quantity: 1
      });
    }
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-2">
              Bestsellers
            </h2>
            <p className="font-body text-muted-foreground">
              Loading our most loved products...
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted"></div>
                <div className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="text-destructive mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
              Unable to Load Bestsellers
            </h3>
            <p className="font-body text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (bestsellers.length === 0) {
    return (
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
              No Bestsellers Available
            </h3>
            <p className="font-body text-muted-foreground">
              Bestselling products will appear here once we have sales data.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-2">
              Bestsellers
            </h2>
            <p className="font-body text-muted-foreground">
              Most loved products by our customers
            </p>
          </div>
          
          {/* Navigation Arrows - Desktop */}
          {totalSlides > 1 && (
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted transition-colors duration-200 flex items-center justify-center"
                aria-label="Previous products"
              >
                <Icon name="ChevronLeft" size={20} />
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted transition-colors duration-200 flex items-center justify-center"
                aria-label="Next products"
              >
                <Icon name="ChevronRight" size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Products Carousel */}
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`,
              width: `${totalSlides * 100}%`
            }}
          >
            {Array.from({ length: totalSlides })?.map((_, slideIndex) => (
              <div 
                key={slideIndex}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
                style={{ width: `${100 / totalSlides}%` }}
              >
                {bestsellers?.slice(slideIndex * itemsPerSlide?.desktop, (slideIndex + 1) * itemsPerSlide?.desktop)?.map((product) => (
                    <div
                      key={product?.id}
                      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <Link to={`/product-detail-page?id=${product?.id}`}>
                          <Image
                            src={product?.image}
                            alt={product?.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 space-y-1">
                          {product?.badges?.slice(0, 1)?.map((badge, index) => (
                            <span
                              key={index}
                              className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-caption font-medium"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>

                        {/* Discount Badge */}
                        {calculateSavings(product?.originalPrice, product?.salePrice) > 0 && (
                          <div className="absolute top-2 right-2">
                            <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-caption font-medium">
                              {calculateSavings(product?.originalPrice, product?.salePrice)}% OFF
                            </span>
                          </div>
                        )}

                        {/* Quick Add Button */}
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handleQuickAdd(product)}
                            className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors duration-200"
                            aria-label="Quick add to cart"
                          >
                            <Icon name="Plus" size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <Link to={`/product-detail-page?id=${product?.id}`}>
                          <h3 className="font-body font-semibold text-sm lg:text-base text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors duration-200">
                            {product?.name}
                          </h3>
                        </Link>
                        
                        {/* Rating */}
                        <div className="flex items-center space-x-1 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)]?.map((_, i) => (
                              <Icon
                                key={i}
                                name="Star"
                                size={12}
                                className={i < Math.floor(product?.rating) ? "text-warning fill-current" : "text-muted-foreground"}
                              />
                            ))}
                          </div>
                          <span className="font-caption text-xs text-muted-foreground">
                            ({product?.reviewCount})
                          </span>
                        </div>

                        {/* Weight */}
                        <p className="font-caption text-xs text-muted-foreground mb-2">
                          {product?.weight}
                        </p>

                        {/* Price */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="font-data font-bold text-base text-foreground">
                            ₹{product?.salePrice || product?.price}
                          </span>
                          {calculateSavings(product?.originalPrice, product?.salePrice) > 0 && (
                            <span className="font-data text-sm text-muted-foreground line-through">
                              ₹{product?.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          onClick={() => handleQuickAdd(product)}
                          iconName="ShoppingCart"
                          iconPosition="left"
                          iconSize={14}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center space-x-2 mt-6 lg:hidden">
            {Array.from({ length: totalSlides })?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentSlide ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link to="/product-collection-grid?filter=bestsellers">
            <Button variant="outline" iconName="ArrowRight" iconPosition="right">
              View All Bestsellers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestsellersCarousel;