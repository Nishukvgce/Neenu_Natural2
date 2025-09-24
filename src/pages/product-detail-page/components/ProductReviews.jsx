import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductReviews = ({ reviews, averageRating, totalReviews }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(reviews?.length / reviewsPerPage);
  
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = reviews?.slice(startIndex, startIndex + reviewsPerPage);

  const ratingDistribution = [5, 4, 3, 2, 1]?.map(rating => {
    const count = reviews?.filter(review => review?.rating === rating)?.length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  const renderStars = (rating, size = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={size}
        className={`${
          index < rating
            ? 'text-warning fill-current' :'text-muted-foreground'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    // <div className="bg-card rounded-lg border border-border p-6">
    //   <h3 className="font-heading font-semibold text-lg text-foreground mb-6">
    //     Customer Reviews
    //   </h3>
    //   {/* Rating Summary */}
    //   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    //     <div className="text-center lg:text-left">
    //       <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
    //         <span className="font-heading font-bold text-3xl text-foreground">
    //           {averageRating?.toFixed(1)}
    //         </span>
    //         <div className="flex">
    //           {renderStars(Math.round(averageRating), 20)}
    //         </div>
    //       </div>
    //       <p className="font-body text-muted-foreground">
    //         Based on {totalReviews} reviews
    //       </p>
    //     </div>

    //     <div className="space-y-2">
    //       {ratingDistribution?.map(({ rating, count, percentage }) => (
    //         <div key={rating} className="flex items-center gap-3">
    //           <div className="flex items-center gap-1 w-12">
    //             <span className="font-caption text-sm text-foreground">{rating}</span>
    //             <Icon name="Star" size={12} className="text-warning fill-current" />
    //           </div>
    //           <div className="flex-1 bg-muted rounded-full h-2">
    //             <div
    //               className="bg-warning rounded-full h-2 transition-all duration-300"
    //               style={{ width: `${percentage}%` }}
    //             />
    //           </div>
    //           <span className="font-caption text-sm text-muted-foreground w-8">
    //             {count}
    //           </span>
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    //   {/* Reviews List */}
    //   <div className="space-y-6">
    //     {currentReviews?.map((review) => (
    //       <div key={review?.id} className="border-b border-border pb-6 last:border-b-0 last:pb-0">
    //         <div className="flex items-start gap-4">
    //           <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
    //             <span className="font-heading font-semibold text-primary">
    //               {review?.customerName?.charAt(0)?.toUpperCase()}
    //             </span>
    //           </div>
              
    //           <div className="flex-1 space-y-2">
    //             <div className="flex items-center justify-between">
    //               <div>
    //                 <h4 className="font-body font-medium text-foreground">
    //                   {review?.customerName}
    //                 </h4>
    //                 <div className="flex items-center gap-2">
    //                   <div className="flex">
    //                     {renderStars(review?.rating)}
    //                   </div>
    //                   <span className="font-caption text-sm text-muted-foreground">
    //                     {formatDate(review?.date)}
    //                   </span>
    //                 </div>
    //               </div>
                  
    //               {review?.verified && (
    //                 <div className="flex items-center gap-1 text-success">
    //                   <Icon name="CheckCircle" size={14} />
    //                   <span className="font-caption text-xs">Verified Purchase</span>
    //                 </div>
    //               )}
    //             </div>
                
    //             <p className="font-body text-muted-foreground">
    //               {review?.comment}
    //             </p>
                
    //             {review?.helpful > 0 && (
    //               <div className="flex items-center gap-2">
    //                 <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors duration-200">
    //                   <Icon name="ThumbsUp" size={14} />
    //                   <span className="font-caption text-sm">
    //                     Helpful ({review?.helpful})
    //                   </span>
    //                 </button>
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    //   {/* Pagination */}
    //   {totalPages > 1 && (
    //     <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border">
    //       <Button
    //         variant="outline"
    //         size="sm"
    //         onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
    //         disabled={currentPage === 1}
    //         iconName="ChevronLeft"
    //         iconPosition="left"
    //       >
    //         Previous
    //       </Button>
          
    //       <div className="flex items-center gap-1">
    //         {Array.from({ length: totalPages }, (_, index) => (
    //           <button
    //             key={index + 1}
    //             onClick={() => setCurrentPage(index + 1)}
    //             className={`w-8 h-8 rounded-lg font-caption text-sm transition-colors duration-200 ${
    //               currentPage === index + 1
    //                 ? 'bg-primary text-primary-foreground'
    //                 : 'text-muted-foreground hover:bg-muted'
    //             }`}
    //           >
    //             {index + 1}
    //           </button>
    //         ))}
    //       </div>
          
    //       <Button
    //         variant="outline"
    //         size="sm"
    //         onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
    //         disabled={currentPage === totalPages}
    //         iconName="ChevronRight"
    //         iconPosition="right"
    //       >
    //         Next
    //       </Button>
    //     </div>
    //   )}
    // </div>
    <></>
  );
};

export default ProductReviews;