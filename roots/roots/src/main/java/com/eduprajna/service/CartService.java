package com.eduprajna.service;

import com.eduprajna.entity.CartItem;
import com.eduprajna.entity.Product;
import com.eduprajna.entity.User;
import com.eduprajna.repository.CartItemRepository;
import com.eduprajna.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    private final CartItemRepository cartRepo;
    private final ProductRepository productRepo;

    public CartService(CartItemRepository cartRepo, ProductRepository productRepo) {
        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
    }

    public List<CartItem> getCart(User user) {
        return cartRepo.findByUser(user);
    }

    public CartItem addToCart(User user, Long productId, int quantity) {
        Product product = productRepo.findById(productId).orElseThrow();
        Optional<CartItem> existing = cartRepo.findByUserAndProduct(user, product);
        CartItem item = existing.orElseGet(() -> {
            CartItem ci = new CartItem();
            ci.setUser(user);
            ci.setProduct(product);
            ci.setPriceAtAdd(product.getPrice() != null ? product.getPrice().doubleValue() : 0.0);
            ci.setQuantity(0);
            return ci;
        });
        item.setQuantity(Math.max(1, (item.getQuantity() == null ? 0 : item.getQuantity()) + quantity));
        return cartRepo.save(item);
    }

    public CartItem updateQuantity(User user, Long productId, int quantity) {
        Product product = productRepo.findById(productId).orElseThrow();
        CartItem item = cartRepo.findByUserAndProduct(user, product).orElseThrow();
        item.setQuantity(Math.max(1, quantity));
        return cartRepo.save(item);
    }

    public void removeItem(User user, Long productId) {
        Product product = productRepo.findById(productId).orElseThrow();
        cartRepo.findByUserAndProduct(user, product).ifPresent(ci -> cartRepo.deleteById(ci.getId()));
    }

    public void clearCart(User user) {
        cartRepo.deleteByUser(user);
    }
}


