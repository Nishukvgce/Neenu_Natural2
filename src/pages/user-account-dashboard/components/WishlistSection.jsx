import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const WishlistSection = ({ wishlistItems, onRemoveFromWishlist, onAddToCart }) => {
  const [sortBy, setSortBy] = useState('recent');
  const [removingIds, setRemovingIds] = useState(new Set());

  const sortOptions = [
    { value: 'recent', label: 'Recently Added' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  const sortedItems = [...wishlistItems]?.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a?.name?.localeCompare(b?.name);
      case 'price-low':
        return a?.price - b?.price;
      case 'price-high':
        return b?.price - a?.price;
      case 'recent':
      default:
        return new Date(b.addedDate) - new Date(a.addedDate);
    }
  });

  const handleAddToCart = (item) => {
    onAddToCart({
      id: item?.id,
      name: item?.name,
      price: item?.price,
      image: item?.image,
      variant: item?.selectedVariant || item?.variants?.[0],
      quantity: 1
    });
  };

  const calculateDiscount = (originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          My Wishlist ({wishlistItems?.length})
        </h1>
        {wishlistItems?.length > 0 && (
          <div className="flex items-center space-x-2">
            <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
              className="font-body text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sortOptions?.map((option) => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {/* Wishlist Items */}
      {wishlistItems?.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Icon name="Heart" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-heading font-semibold text-foreground mb-2">
            Your wishlist is empty
          </h3>
          <p className="font-body text-muted-foreground mb-4">
            Save your favorite products to buy them later.
          </p>
          <Link to="/product-collection-grid">
            <Button variant="default">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedItems?.map((item) => (
            <div key={item?.id} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-warm-md transition-shadow duration-200">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item?.image}
                  alt={item?.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                  {item?.originalPrice > item?.price && (
                    <span className="bg-destructive text-destructive-foreground text-xs font-caption font-bold px-2 py-1 rounded">
                      {calculateDiscount(item?.originalPrice, item?.price)}% OFF
                    </span>
                  )}
                  {item?.badges?.map((badge, index) => (
                    <span
                      key={index}
                      className="bg-success text-success-foreground text-xs font-caption font-medium px-2 py-1 rounded"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Remove from Wishlist */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (removingIds.has(item?.id)) return;
                    setRemovingIds(prev => new Set(prev).add(item?.id));
                    Promise.resolve(onRemoveFromWishlist(item?.productId || item?.id))
                      .catch(() => {})
                      .finally(() => {
                        setRemovingIds(prev => {
                          const next = new Set(prev);
                          next.delete(item?.id);
                          return next;
                        });
                      });
                  }}
                  disabled={removingIds.has(item?.id)}
                  className={`absolute top-2 right-2 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors duration-200 ${removingIds.has(item?.id) ? 'bg-muted cursor-not-allowed' : 'bg-background/80 hover:bg-background'}`}
                  aria-label="Remove from wishlist"
                  title="Remove"
                >
                  {removingIds.has(item?.id) ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-foreground border-t-transparent rounded-full"></span>
                  ) : (
                    <Icon name="X" size={16} className="text-foreground" />
                  )}
                </button>

                {/* Stock Status */}
                {(item?.inStock === false) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-destructive text-destructive-foreground text-sm font-caption font-medium px-3 py-1 rounded">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link
                  to={`/product-detail-page?id=${item?.id}`}
                  className="block hover:text-primary transition-colors duration-200"
                >
                  <h3 className="font-body font-medium text-foreground mb-2 line-clamp-2">
                    {item?.name}
                  </h3>
                </Link>

                {/* Variant Selection */}
                {item?.variants && item?.variants?.length > 1 && (
                  <div className="mb-3">
                    <p className="font-caption text-xs text-muted-foreground mb-1">
                      Size/Weight
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {item?.variants?.slice(0, 3)?.map((variant, index) => (
                        <span
                          key={index}
                          className="text-xs font-caption px-2 py-1 bg-muted rounded border border-border"
                        >
                          {variant}
                        </span>
                      ))}
                      {item?.variants?.length > 3 && (
                        <span className="text-xs font-caption text-muted-foreground">
                          +{item?.variants?.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="font-data font-bold text-foreground">
                    ₹{item?.price?.toFixed(2)}
                  </span>
                  {item?.originalPrice > item?.price && (
                    <span className="font-data text-sm text-muted-foreground line-through">
                      ₹{item?.originalPrice?.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Rating */}
                {item?.rating && (
                  <div className="flex items-center space-x-1 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)]?.map((_, i) => (
                        <Icon
                          key={i}
                          name="Star"
                          size={12}
                          className={`${
                            i < Math.floor(item?.rating)
                              ? 'text-warning fill-current' :'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-caption text-xs text-muted-foreground">
                      ({item?.reviewCount})
                    </span>
                  </div>
                )}

                {/* Added Date */}
                <p className="font-caption text-xs text-muted-foreground mb-3">
                  Added on {new Date(item.addedDate)?.toLocaleDateString('en-IN')}
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    variant="default"
                    size="sm"
                    fullWidth
                    onClick={() => handleAddToCart(item)}
                    disabled={item?.inStock === false}
                    iconName="ShoppingCart"
                    iconPosition="left"
                  >
                    {item?.inStock === false ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Link to={`/product-detail-page?id=${item?.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Recommendations */}
      {wishlistItems?.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-foreground">
              You might also like
            </h3>
            <Link to="/product-collection-grid">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <p className="font-body text-muted-foreground">
            Based on your wishlist, we recommend checking out our featured collections and new arrivals.
          </p>
        </div>
      )}
    </div>
  );
};

export default WishlistSection;