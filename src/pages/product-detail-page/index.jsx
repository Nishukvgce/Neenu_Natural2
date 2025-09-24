import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import ProductImageGallery from './components/ProductImageGallery';
import ProductInfo from './components/ProductInfo';
import ProductDetails from './components/ProductDetails';
import ProductFAQ from './components/ProductFAQ';
import ProductReviews from './components/ProductReviews';
import RelatedProducts from './components/RelatedProducts';
import productApi from '../../services/productApi';
import dataService from '../../services/dataService';
import apiClient from '../../services/api';

const ProductDetailPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams?.get('id') || '1';
  
  const { cartItems, addToCart, addToWishlist, removeFromWishlist, isInWishlist, getCartItemCount } = useCart();

  // State for product data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Convert relative or bare filenames to absolute URLs under API base
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

  // Load product data from database
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching product details for ID:', productId);
        
        // Try to fetch from backend API first
        let productData = null;
        try {
          productData = await productApi.getById(productId);
          console.log('Successfully loaded product from API:', productData);
          console.log('Product image data:', {
            images: productData?.images,
            gallery: productData?.gallery,
            image: productData?.image,
            imageUrl: productData?.imageUrl,
            image_path: productData?.image_path,
            thumbnailUrl: productData?.thumbnailUrl
          });
        } catch (apiError) {
          console.warn('Backend API failed, falling back to local data:', apiError?.message);
          
          // Fallback to hardcoded data from dataService
          const response = await dataService.getProducts();
          const products = response?.data || [];
          productData = products.find(p => p.id === productId || p.id === parseInt(productId));
          
          if (!productData) {
            throw new Error(`Product with ID ${productId} not found`);
          }
          console.log('Loaded product from fallback data:', productData);
          console.log('Fallback product image data:', {
            images: productData?.images,
            gallery: productData?.gallery,
            image: productData?.image,
            imageUrl: productData?.imageUrl,
            image_path: productData?.image_path,
            thumbnailUrl: productData?.thumbnailUrl
          });
        }

        // Normalize product data to expected format
        const normalizedProduct = {
          id: productData?.id,
          name: productData?.name || productData?.title,
          shortDescription: productData?.shortDescription || productData?.description?.substring(0, 100) + '...',
          description: productData?.description || 'No description available.',
          images: (() => {
            // Only use actual backend image data, no fallback images
            if (productData?.images && Array.isArray(productData.images) && productData.images.length > 0) {
              return productData.images.map(resolveImageUrl).filter(Boolean);
            }
            if (productData?.gallery && Array.isArray(productData.gallery) && productData.gallery.length > 0) {
              return productData.gallery.map(resolveImageUrl).filter(Boolean);
            }
            if (productData?.imageUrl && productData.imageUrl.trim() !== '') {
              return [resolveImageUrl(productData.imageUrl)].filter(Boolean);
            }
            if (productData?.image && productData.image.trim() !== '') {
              return [resolveImageUrl(productData.image)].filter(Boolean);
            }
            if (productData?.image_path && productData.image_path.trim() !== '') {
              return [resolveImageUrl(productData.image_path)].filter(Boolean);
            }
            if (productData?.thumbnailUrl && productData.thumbnailUrl.trim() !== '') {
              return [resolveImageUrl(productData.thumbnailUrl)].filter(Boolean);
            }
            // Return empty array if no actual image data found
            return [];
          })(),
          variants: productData?.variants || [
            {
              id: "default",
              weight: productData?.weight || "Default",
              price: productData?.price || productData?.salePrice || 0,
              originalPrice: productData?.originalPrice || productData?.mrp || productData?.price || 0,
              stock: productData?.stock || 10
            }
          ],
          badges: productData?.badges || [],
          features: productData?.features || [],
          ingredients: productData?.ingredients || {
            description: "Ingredient information not available.",
            primary: [],
            spices: []
          },
          nutrition: productData?.nutrition || {},
          rating: productData?.rating || productData?.ratingValue || 0,
          reviewCount: productData?.reviewCount || 0,
          category: productData?.category || productData?.categoryId,
          brand: productData?.brand || productData?.manufacturer || 'Neenu\'s Natural'
        };

        setProduct(normalizedProduct);

        // Load related products (same category, excluding current)
        try {
          const all = await productApi.getAll();
          const items = Array.isArray(all) ? all : [];
          const sameCategory = items
            .filter(p => (p?.category || p?.categoryId) === normalizedProduct.category && p?.id !== normalizedProduct.id)
            .slice(0, 8);

          // Normalize for RelatedProducts card structure
          const normalizedRelated = sameCategory.map(p => ({
            id: p?.id,
            name: p?.name || p?.title,
            image: resolveImageUrl(p?.image || p?.imageUrl || p?.thumbnailUrl),
            rating: p?.rating || 4.5,
            reviewCount: p?.reviewCount || 0,
            badges: p?.badges || [],
            variants: [
              {
                id: 'default',
                weight: p?.weight || 'Default',
                price: parseFloat(p?.price ?? p?.salePrice ?? 0) || 0,
                originalPrice: parseFloat(p?.originalPrice ?? p?.price ?? p?.salePrice ?? 0) || 0
              }
            ]
          }));
          setRelatedProducts(normalizedRelated);
        } catch (e) {
          // Non-fatal if related fail; keep empty
          setRelatedProducts([]);
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const breadcrumbItems = [
    { label: 'Home', path: '/homepage' },
    { label: 'Products', path: '/product-collection-grid' },
    { label: product?.category || 'Category', path: `/product-collection-grid?category=${product?.category}`},
    { label: product?.name || 'Product', path: `/product-detail-page?id=${productId}` }
  ];

  const handleAddToCart = (item) => {
    if (!product) return;
    
    const variant = product?.variants?.find(v => v?.id === item?.variantId);
    if (!variant) return;

    const productToAdd = {
      id: `${item?.productId}-${item?.variantId}`,
      productId: item?.productId,
      variantId: item?.variantId,
      name: product?.name,
      variant: variant?.weight,
      price: parseFloat(variant?.price) || 0,
      originalPrice: parseFloat(variant?.originalPrice) || parseFloat(variant?.price) || 0,
      image: product?.images?.[0],
      category: product?.category,
      brand: product?.brand
    };
    
    addToCart(productToAdd, item?.quantity || 1);
  };

  const handleAddToWishlist = () => {
    if (!product) return;
    
    const isInWishlistStatus = isInWishlist(product?.id);
    
    if (isInWishlistStatus) {
      removeFromWishlist(product?.id);
    } else {
      const wishlistProduct = {
        id: product?.id,
        name: product?.name,
        image: product?.images?.[0],
        price: parseFloat(product?.variants?.[0]?.price) || 0
      };
      addToWishlist(wishlistProduct);
    }
  };

  const isProductInWishlist = product ? isInWishlist(product?.id) : false;
  const averageRating = product?.rating || 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          cartItemCount={getCartItemCount()}
          cartItems={cartItems}
          onSearch={() => {}}
        />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading product details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          cartItemCount={getCartItemCount()}
          cartItems={cartItems}
          onSearch={() => {}}
        />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-destructive mb-4">Error loading product: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          cartItemCount={getCartItemCount()}
          cartItems={cartItems}
          onSearch={() => {}}
        />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Product not found</p>
              <a 
                href="/product-collection-grid" 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Browse Products
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemCount={getCartItemCount()}
        cartItems={cartItems}
        onSearch={() => {}}
      />
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb customItems={breadcrumbItems} />
        
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductImageGallery 
              images={product?.images}
              productName={product?.name}
            />
          </div>
          
          {/* Product Information */}
          <div>
            <ProductInfo
              product={product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              isInWishlist={isProductInWishlist}
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="mb-12">
          <ProductDetails product={product} />
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <ProductFAQ faqs={[]} />
        </div>

        {/* Reviews Section */}
        <div className="mb-12">
          <ProductReviews
            reviews={[]}
            averageRating={averageRating}
            totalReviews={0}
          />
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <RelatedProducts
            products={relatedProducts}
            onAddToCart={handleAddToCart}
          />
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;