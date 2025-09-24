import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import categoryApi from '../../../services/categoryApi';
import productApi from '../../../services/productApi';
import apiClient from '../../../services/api';

const CategoryTiles = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveImageUrl = (candidate) => {
    if (!candidate || typeof candidate !== 'string') return '';
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
    // Extract filename if absolute path
    if (/^[a-zA-Z]:\\/.test(candidate) || candidate.startsWith('\\\\') || candidate.startsWith('/') || candidate.includes('\\')) {
      const parts = candidate.split(/\\|\//);
      candidate = parts[parts.length - 1];
    }
    // Map bare filename to API route
    if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
      candidate = `/admin/products/images/${candidate}`;
    }
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching categories from backend API...');
        
        // Try to get categories from backend API
        const categoriesRes = await categoryApi.getAll();
        let categoriesData = categoriesRes?.data || categoriesRes || [];
        
        // Additionally, fetch products to derive category images when missing
        let products = [];
        try {
          const productsRes = await productApi.getAll();
          products = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
        } catch {}
        const firstImageByCategory = {};
        products.forEach((p) => {
          const catKey = p?.category || p?.categoryId;
          if (!catKey) return;
          if (!firstImageByCategory[catKey]) {
            const candidate = p?.imageUrl || p?.image || p?.image_path || p?.thumbnailUrl;
            const resolved = resolveImageUrl(candidate);
            if (resolved) firstImageByCategory[catKey] = resolved;
          }
        });
        
        // Process categories to ensure proper format
        const processedCategories = categoriesData.map(category => {
          const id = category.id || category.name?.toLowerCase().replace(/\s+/g, '-');
          const name = category.name || category.categoryName || id;
          const derivedImage = firstImageByCategory[id] || firstImageByCategory[name] || '';
          const finalImage = resolveImageUrl(category.image || category.imageUrl || derivedImage);
          return {
            id,
            name,
            description: category.description || `Quality ${name} products`,
            image: finalImage || '/assets/images/no_image.png',
            link: `/product-collection-grid?category=${id}`,
            productCount: category.productCount ? `${category.productCount}+ Products` : "Products Available",
            featured: category.featured || false,
          };
        });
        
        setCategories(processedCategories);
        console.log('Successfully loaded categories:', processedCategories.length);
        
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Loading categories...
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-4">
              Shop by Category
            </h2>
            <p className="font-body text-lg text-destructive max-w-2xl mx-auto">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our carefully curated collection of natural and handmade food products
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
          {categories?.map((category) => (
            <Link
              key={category?.id}
              to={category?.link}
              className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Category Image */}
              <div className="aspect-square overflow-hidden">
                <Image
                  src={category?.image}
                  alt={category?.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-heading font-semibold text-sm lg:text-base mb-1">
                  {category?.name}
                </h3>
                <p className="font-caption text-xs opacity-90 hidden lg:block">
                  {category?.productCount}
                </p>
              </div>

              {/* Badges */}
              {category?.badge && (
                <div className="absolute top-2 right-2">
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-caption font-medium">
                    {category?.badge}
                  </span>
                </div>
              )}

              {category?.seasonal && (
                <div className="absolute top-2 left-2">
                  <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-caption font-medium">
                    Seasonal
                  </span>
                </div>
              )}

              {category?.featured && (
                <div className="absolute top-2 left-2">
                  <div className="bg-warning text-warning-foreground p-1 rounded-full">
                    <Icon name="Star" size={12} />
                  </div>
                </div>
              )}

              {/* Hover Arrow */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Icon name="ArrowRight" size={20} color="white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories */}
        <div className="text-center mt-8">
          <Link to="/product-collection-grid">
            <button className="font-body font-medium text-primary hover:text-primary/80 transition-colors duration-200 inline-flex items-center space-x-2">
              <span>View All Products</span>
              <Icon name="ArrowRight" size={16} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryTiles;