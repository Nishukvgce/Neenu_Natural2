import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import FilterSidebar from './components/FilterSidebar';
import FilterChips from './components/FilterChips';
import SortDropdown from './components/SortDropdown';
import ProductGrid from './components/ProductGrid';
import QuickViewModal from './components/QuickViewModal';
import Button from '../../components/ui/Button';
import dataService from '../../services/dataService';
import productApi from '../../services/productApi';
import apiClient from '../../services/api';

const ProductCollectionGrid = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { addToCart, getCartItemCount, cartItems, addToWishlist, removeFromWishlist, isInWishlist, wishlistItems: wishlistState } = useCart();

  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState('best-selling');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  // Derive wishlist ids from CartContext to drive heart fill state
  const wishlistItems = (wishlistState || []).map(w => w.id);

  // Filter state
  const [filters, setFilters] = useState({
    priceRange: [],
    dietary: [],
    categories: [],
    brands: []
  });

  // Resolve relative image URLs returned by backend to absolute URLs using API base
  const resolveImageUrl = (p) => {
    const candidate = p?.imageUrl || p?.image || p?.image_path || p?.thumbnailUrl;
    if (!candidate) return '/assets/images/no_image.png';
    if (candidate.startsWith('http://') || candidate.startsWith('https://') || candidate.startsWith('data:')) {
      return candidate;
    }
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  // Initialize products and apply URL filters (category, search)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // Load products from backend API
        let apiProducts = [];
        try {
          console.log('Fetching products from backend API...');
          const res = await productApi.getAll();
          // Spring Boot API returns array directly
          apiProducts = Array.isArray(res) ? res : [];
          console.log('Successfully loaded products from API:', apiProducts.length);
        } catch (e) {
          console.warn('Backend API failed, falling back to local data:', e?.message);
          // Fallback to hardcoded data from dataService
          const response = await dataService.getProducts();
          apiProducts = response?.data || [];
          console.log('Loaded products from fallback data:', apiProducts.length);
        }

        // Normalize backend products to UI shape
        const normalizedProducts = apiProducts.map((p) => ({
          id: p?.id,
          name: p?.name || p?.title,
          category: p?.category || p?.categoryId || p?.subcategory || 'misc',
          subcategory: p?.subcategory,
          brand: p?.brand || p?.manufacturer || 'Brand',
          price: p?.price ?? p?.salePrice ?? p?.mrp ?? 0,
          salePrice: p?.salePrice ?? p?.price ?? p?.mrp ?? 0,
          originalPrice: p?.originalPrice ?? p?.mrp ?? p?.price ?? 0,
          rating: p?.rating ?? p?.ratingValue ?? 0,
          bestseller: Boolean(p?.bestseller),
          image: resolveImageUrl(p),
          description: p?.description || '',
          // Include stock fields when present; treat missing as unlimited
          stockQuantity: p?.stockQuantity ?? null,
          inStock: p?.inStock !== false, // Default to true if not specified
          weight: p?.weight || 'N/A'
        }));

        // Apply URL filters
        const categoryParam = (searchParams.get('category') || '').toLowerCase();
        const searchParamRaw = searchParams.get('search') || '';
        const searchParam = searchParamRaw.toLowerCase();

        let working = normalizedProducts;
        if (categoryParam) {
          working = working.filter(p => String(p?.category || '').toLowerCase() === categoryParam);
        }
        if (searchParam) {
          // Prefer exact name match; if none, fallback to substring contains
          const exact = working.filter(p => String(p?.name || '').toLowerCase() === searchParam);
          working = exact.length > 0 ? exact : working.filter(p => String(p?.name || '').toLowerCase().includes(searchParam));
        }

        setProducts(normalizedProducts);
        setFilteredProducts(working);
      } catch (error) {
        console.error('Error loading products:', error);
        // Set empty array as fallback
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [location.search]); // Depend on location.search for category filtering

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply filters
    if (filters?.priceRange?.length > 0) {
      filtered = filtered?.filter(product => {
        return filters?.priceRange?.some(range => {
          switch (range) {
            case 'under-200':
              return product?.salePrice < 200;
            case '200-500':
              return product?.salePrice >= 200 && product?.salePrice <= 500;
            case '500-1000':
              return product?.salePrice >= 500 && product?.salePrice <= 1000;
            case 'above-1000':
              return product?.salePrice > 1000;
            default:
              return true;
          }
        });
      });
    }

    if (filters?.dietary?.length > 0) {
      filtered = filtered?.filter(product =>
        filters?.dietary?.some(diet => product?.dietary?.includes(diet))
      );
    }

    if (filters?.categories?.length > 0) {
      filtered = filtered?.filter(product =>
        filters?.categories?.includes(product?.category)
      );
    }

    if (filters?.brands?.length > 0) {
      filtered = filtered?.filter(product =>
        filters?.brands?.includes(product?.brand)
      );
    }

    // Apply sorting
    switch (currentSort) {
      case 'price-low-high':
        filtered?.sort((a, b) => a?.salePrice - b?.salePrice);
        break;
      case 'price-high-low':
        filtered?.sort((a, b) => b?.salePrice - a?.salePrice);
        break;
      case 'newest':
        filtered?.sort((a, b) => b?.id - a?.id);
        break;
      case 'oldest':
        filtered?.sort((a, b) => a?.id - b?.id);
        break;
      case 'name-a-z':
        filtered?.sort((a, b) => a?.name?.localeCompare(b?.name));
        break;
      case 'name-z-a':
        filtered?.sort((a, b) => b?.name?.localeCompare(a?.name));
        break;
      case 'rating-high-low':
        filtered?.sort((a, b) => b?.rating - a?.rating);
        break;
      case 'best-selling':
      default:
        filtered?.sort((a, b) => (b?.bestseller ? 1 : 0) - (a?.bestseller ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filters, currentSort]);

  // Handle filter changes
  const handleFilterChange = (filterType, newValue) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: newValue
    }));
  };

  const handleRemoveFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev?.[filterType]?.filter(item => item !== value)
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      priceRange: [],
      dietary: [],
      categories: [],
      brands: []
    });
  };

  // Handle product actions
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (product, variant = null, quantity = 1) => {
    const productToAdd = {
      id: product?.id,
      productId: product?.id, // Add productId for API compatibility
      name: product?.name,
      image: product?.image,
      price: variant?.price || product?.price, // Use 'price' instead of 'salePrice'
      originalPrice: variant?.originalPrice || product?.originalPrice,
      variant: variant?.weight || 'Default',
      category: product?.category,
      brand: product?.brand
    };

    addToCart(productToAdd, quantity);
    
    // Show success feedback
    console.log('Added to cart:', productToAdd);
  };

  const handleAddToWishlist = (productOrId) => {
    const product = typeof productOrId === 'object' ? productOrId : products.find(p => p.id === productOrId);
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        // pass stock info when available
        ...(product.stockQuantity !== undefined ? { stockQuantity: product.stockQuantity } : {}),
        ...(product.inStock !== undefined ? { inStock: product.inStock } : {})
      });
    }
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/homepage' },
    { label: 'Products', path: '/product-collection-grid' }
  ];

  const categoryTitle = searchParams?.get('category')?.replace(/-/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase()) || 'All Products';

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemCount={getCartItemCount()}
        cartItems={cartItems}
        onSearch={(query) => console.log('Search:', query)}
      />
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb customItems={breadcrumbItems} />

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
            {categoryTitle}
          </h1>
          <p className="font-body text-muted-foreground">
            Discover our collection of natural, handmade products crafted with love and tradition.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar
              isOpen={false}
              onClose={() => {}}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearAllFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Mobile Filter Button & Sort */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setIsMobileFilterOpen(true)}
                iconName="Filter"
                iconPosition="left"
                className="lg:hidden"
              >
                Filters
              </Button>

              <div className="flex items-center gap-4">
                <span className="font-body text-sm text-muted-foreground">
                  {filteredProducts?.length} products
                </span>
                <SortDropdown
                  currentSort={currentSort}
                  onSortChange={setCurrentSort}
                />
              </div>
            </div>

            {/* Active Filter Chips */}
            <FilterChips
              activeFilters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />

            {/* Product Grid */}
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              onQuickView={handleQuickView}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              wishlistItems={wishlistItems}
            />

            {/* Load More Button */}
            {!loading && filteredProducts?.length > 0 && hasMoreProducts && (
              <div className="text-center pt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Simulate loading more products
                    setCurrentPage(prev => prev + 1);
                    // In real app, this would load more products
                    if (currentPage >= 3) {
                      setHasMoreProducts(false);
                    }
                  }}
                >
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Mobile Filter Sidebar */}
      <FilterSidebar
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearAllFilters}
        isMobile={true}
      />
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductCollectionGrid;