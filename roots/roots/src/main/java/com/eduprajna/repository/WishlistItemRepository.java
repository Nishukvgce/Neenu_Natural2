package com.eduprajna.repository;

import com.eduprajna.entity.Product;
import com.eduprajna.entity.User;
import com.eduprajna.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserOrderByCreatedAtDesc(User user);
    Optional<WishlistItem> findByUserAndProduct(User user, Product product);
    void deleteByUserAndProduct(User user, Product product);
    long deleteByUserAndProduct_Id(User user, Long productId);
    long deleteByUserAndProductId(User user, Long productId);
    long countByUser(User user);
}
