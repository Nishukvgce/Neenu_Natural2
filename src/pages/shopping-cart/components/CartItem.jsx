import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const CartItem = ({ item, onUpdateQuantity, onRemoveItem, onSaveForLater }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity === 0) {
      onRemoveItem(item?.id);
    } else {
      onUpdateQuantity(item?.id, newQuantity);
    }
  };

  const discountAmount = (item?.originalPrice && item?.originalPrice > item?.price) ? item?.originalPrice - item?.price : 0;
  const discountPercentage = discountAmount > 0 ? Math.round((discountAmount / item?.originalPrice) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-warm">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={item?.image}
            alt={item?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-base text-foreground truncate">
                {item?.name}
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                {item?.variant}
              </p>
              {item?.badges && item?.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item?.badges?.map((badge, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-medium bg-accent/10 text-accent"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemoveItem(item?.id)}
              className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors duration-200 ml-2"
              aria-label="Remove item"
            >
              <Icon name="Trash2" size={18} />
            </button>
          </div>

          {/* Price and Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-data font-bold text-lg text-foreground">
                  ₹{(item?.price * item?.quantity)?.toFixed(2)}
                </span>
                {discountAmount > 0 && (
                  <>
                    <span className="font-data text-sm text-muted-foreground line-through">
                      ₹{(item?.originalPrice * item?.quantity)?.toFixed(2)}
                    </span>
                    <span className="font-caption text-xs font-medium text-success bg-success/10 px-2 py-1 rounded">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-caption text-xs text-muted-foreground">
                  ₹{item?.price?.toFixed(2)} per unit
                </p>
                {discountAmount > 0 && (
                  <p className="font-caption text-xs text-success">
                    You save ₹{(discountAmount * item?.quantity)?.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => handleQuantityChange(item?.quantity - 1)}
                  className="p-2 hover:bg-muted transition-colors duration-200 rounded-l-lg"
                  disabled={item?.quantity <= 1}
                >
                  <Icon name="Minus" size={16} />
                </button>
                <span className="font-data font-medium px-4 py-2 min-w-[3rem] text-center">
                  {item?.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item?.quantity + 1)}
                  className="p-2 hover:bg-muted transition-colors duration-200 rounded-r-lg"
                >
                  <Icon name="Plus" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSaveForLater(item?.id)}
              iconName="Heart"
              iconPosition="left"
              iconSize={14}
            >
              Save for Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;