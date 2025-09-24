package com.eduprajna.service;

import com.eduprajna.dto.WishlistItemDTO;
import com.eduprajna.entity.Product;
import com.eduprajna.entity.User;
import com.eduprajna.entity.WishlistItem;
import com.eduprajna.repository.ProductRepository;
import com.eduprajna.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {
    private static final Logger log = LoggerFactory.getLogger(WishlistService.class);
    private final WishlistItemRepository wishlistRepo;
    private final ProductRepository productRepo;

    public WishlistService(WishlistItemRepository wishlistRepo, ProductRepository productRepo) {
        this.wishlistRepo = wishlistRepo;
        this.productRepo = productRepo;
    }

    public List<WishlistItemDTO> getWishlist(User user) {
        return wishlistRepo.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public WishlistItemDTO addToWishlist(User user, Long productId) {
        Product product = productRepo.findById(productId).orElseThrow();
        WishlistItem item = wishlistRepo.findByUserAndProduct(user, product).orElseGet(() -> {
            WishlistItem wi = new WishlistItem();
            wi.setUser(user);
            wi.setProduct(product);
            return wi;
        });
        WishlistItem saved = wishlistRepo.save(item);
        return toDTO(saved);
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        // Delete by relation key without loading Product entity.
        // This works even if the product row was removed from DB.
        long deleted = 0L;
        try {
            deleted = wishlistRepo.deleteByUserAndProduct_Id(user, productId);
            if (deleted == 0) {
                // Fallback to legacy approach if derived delete didn't match (e.g., older Spring Data behavior)
                productRepo.findById(productId).ifPresent(product -> wishlistRepo.deleteByUserAndProduct(user, product));
            }
        } finally {
            log.info("Wishlist delete for user={} productId={} deletedRows={}", user.getId(), productId, deleted);
        }
    }

    public long count(User user) {
        return wishlistRepo.countByUser(user);
    }

    private WishlistItemDTO toDTO(WishlistItem item) {
        Product p = item.getProduct();
        WishlistItemDTO dto = new WishlistItemDTO();
        dto.productId = p.getId();
        dto.productName = p.getName();
        dto.productImage = p.getImageUrl();
        dto.productPrice = p.getPrice();
        dto.createdAt = item.getCreatedAt();
        // Stock flags: if explicit inStock=false, respect; if stockQuantity provided and <=0, false; if null, treat as available
        Integer stockQty = p.getStockQuantity();
        Boolean explicit = p.getInStock();
        dto.stockQuantity = stockQty;
        dto.inStock = (explicit != null) ? explicit : (stockQty == null || stockQty > 0);
        dto.category = p.getCategory();
        dto.brand = null; // brand not present on Product entity
        return dto;
    }
}
