package com.eduprajna.Controller;

import com.eduprajna.dto.CartItemDTO;
import com.eduprajna.entity.CartItem;
import com.eduprajna.entity.User;
import com.eduprajna.service.CartService;
import com.eduprajna.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {
    private static final Logger logger = LoggerFactory.getLogger(CartController.class);
    
    private final CartService cartService;
    private final UserService userService;

    public CartController(CartService cartService, UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }

    private User requireUser(String email) { 
        return userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email)); 
    }
    
    private CartItemDTO toDTO(CartItem ci) {
        CartItemDTO dto = new CartItemDTO();
        dto.id = ci.getId();
        dto.productId = ci.getProduct().getId();
        dto.name = ci.getProduct().getName();
        dto.imageUrl = ci.getProduct().getImageUrl();
        dto.quantity = ci.getQuantity();
        dto.price = ci.getPriceAtAdd();
        dto.lineTotal = (ci.getPriceAtAdd() != null ? ci.getPriceAtAdd() : 0.0) * ci.getQuantity();
        return dto;
    }

    @GetMapping
    public ResponseEntity<?> getCart(@RequestParam("email") String email) {
        try {
            logger.debug("Getting cart for user: {}", email);
            
            if (email == null || email.trim().isEmpty()) {
                logger.warn("Empty email provided for cart request");
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            User user = requireUser(email);
            List<CartItemDTO> items = cartService.getCart(user).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
            
            logger.debug("Retrieved {} cart items for user: {}", items.size(), email);
            return ResponseEntity.ok(items);
        } catch (RuntimeException e) {
            logger.error("User not found for cart request: {}", email, e);
            return ResponseEntity.status(404).body("User not found");
        } catch (Exception e) {
            logger.error("Error getting cart for user: {}", email, e);
            return ResponseEntity.status(500).body("Internal server error while getting cart");
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestParam("email") String email, @RequestBody Map<String, Object> body) {
        try {
            logger.debug("Adding item to cart for user: {}", email);
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            if (body.get("productId") == null) {
                return ResponseEntity.badRequest().body("Product ID is required");
            }
            
            // Handle both numeric and string product IDs
            Long productId;
            Object productIdObj = body.get("productId");
            if (productIdObj instanceof Number) {
                productId = ((Number) productIdObj).longValue();
            } else if (productIdObj instanceof String) {
                String productIdStr = (String) productIdObj;
                // Extract numeric part from strings like "2-default"
                String numericPart = productIdStr.split("-")[0];
                productId = Long.parseLong(numericPart);
            } else {
                return ResponseEntity.badRequest().body("Invalid product ID format");
            }
            
            int quantity = body.get("quantity") == null ? 1 : ((Number) body.get("quantity")).intValue();
            
            User user = requireUser(email);
            CartItem ci = cartService.addToCart(user, productId, quantity);
            
            logger.info("Added product {} to cart for user: {}", productId, email);
            return ResponseEntity.ok(toDTO(ci));
        } catch (IllegalArgumentException e) {
            logger.warn("Bad request while adding to cart: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            logger.warn("Validation failed while adding to cart: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Error adding to cart for user: {}", email, e);
            return ResponseEntity.status(404).body("User or product not found");
        } catch (Exception e) {
            logger.error("Error adding to cart for user: {}", email, e);
            return ResponseEntity.status(500).body("Internal server error while adding to cart");
        }
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateQuantity(@RequestParam("email") String email, @RequestBody Map<String, Object> body) {
        try {
            logger.debug("Updating cart quantity for user: {}", email);
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            if (body.get("productId") == null || body.get("quantity") == null) {
                return ResponseEntity.badRequest().body("Product ID and quantity are required");
            }
            
            Long productId = ((Number) body.get("productId")).longValue();
            int quantity = ((Number) body.get("quantity")).intValue();
            
            User user = requireUser(email);
            CartItem ci = cartService.updateQuantity(user, productId, quantity);
            
            logger.info("Updated cart item quantity for product {} for user: {}", productId, email);
            return ResponseEntity.ok(toDTO(ci));
        } catch (IllegalArgumentException e) {
            logger.warn("Bad request while updating cart: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            logger.warn("Validation failed while updating cart: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Error updating cart for user: {}", email, e);
            return ResponseEntity.status(404).body("User, product, or cart item not found");
        } catch (Exception e) {
            logger.error("Error updating cart for user: {}", email, e);
            return ResponseEntity.status(500).body("Internal server error while updating cart");
        }
    }

    @PostMapping("/remove")
    public ResponseEntity<?> remove(@RequestParam("email") String email, @RequestBody Map<String, Object> body) {
        try {
            logger.debug("Removing item from cart for user: {}", email);
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            if (body.get("productId") == null) {
                return ResponseEntity.badRequest().body("Product ID is required");
            }
            
            Long productId = ((Number) body.get("productId")).longValue();
            User user = requireUser(email);
            cartService.removeItem(user, productId);
            
            logger.info("Removed product {} from cart for user: {}", productId, email);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            logger.error("Error removing from cart for user: {}", email, e);
            return ResponseEntity.status(404).body("User or product not found");
        } catch (Exception e) {
            logger.error("Error removing from cart for user: {}", email, e);
            return ResponseEntity.status(500).body("Internal server error while removing from cart");
        }
    }
}
