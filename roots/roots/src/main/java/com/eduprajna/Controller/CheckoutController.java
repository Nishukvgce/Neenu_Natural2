package com.eduprajna.Controller;

import com.eduprajna.dto.CartItemDTO;
import com.eduprajna.dto.OrderReviewDTO;
import com.eduprajna.entity.*;
import com.eduprajna.repository.AddressRepository;
import com.eduprajna.repository.CheckoutSelectionRepository;
import com.eduprajna.service.CartService;
import com.eduprajna.service.OrderService;
import com.eduprajna.service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * CheckoutController handles the multi-step checkout process
 * 
 * Flow:
 * 1. POST /selection - Save user's checkout selections (address, delivery, payment)
 * 2. GET /review - Get order review with all details
 * 3. POST /place-order - Place the order transactionally
 */
@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "*")
public class CheckoutController {
    private static final Logger logger = LoggerFactory.getLogger(CheckoutController.class);
    
    private final UserService userService;
    private final CartService cartService;
    private final CheckoutSelectionRepository selectionRepo;
    private final AddressRepository addressRepo;
    private final OrderService orderService;

    public CheckoutController(UserService userService, CartService cartService, 
                            CheckoutSelectionRepository selectionRepo, AddressRepository addressRepo, 
                            OrderService orderService) {
        this.userService = userService;
        this.cartService = cartService;
        this.selectionRepo = selectionRepo;
        this.addressRepo = addressRepo;
        this.orderService = orderService;
    }

    /**
     * Helper method to validate and get user by email
     */
    private User requireUser(String email) { 
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        return userService.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email)); 
    }

    /**
     * Save or update checkout selection (address, delivery option, payment method)
     * This endpoint is called at each step of the checkout process
     */
    @PostMapping("/selection")
    public ResponseEntity<?> saveSelection(@RequestParam("email") String email, @RequestBody Map<String, Object> body) {
        try {
            logger.debug("Saving checkout selection for user: {}", email);
            
            User user = requireUser(email);
            
            // Get existing selection or create new one
            CheckoutSelection selection = selectionRepo.findByUser(user)
                .orElseGet(() -> {
                    CheckoutSelection s = new CheckoutSelection();
                    s.setUser(user);
                    // Set default values to avoid null constraint violations
                    s.setDeliveryOption("standard");
                    s.setPaymentMethod("cod");
                    return s;
                });
            
            // Update selection based on provided data
            if (body.get("addressId") != null) {
                Long addressId = ((Number) body.get("addressId")).longValue();
                // Validate address belongs to user
                Address address = addressRepo.findById(addressId)
                    .orElseThrow(() -> new RuntimeException("Address not found: " + addressId));
                if (!address.getUser().getId().equals(user.getId())) {
                    return ResponseEntity.badRequest().body("Address does not belong to user");
                }
                selection.setAddressId(addressId);
                logger.debug("Updated address selection: {}", addressId);
            }
            
            if (body.get("deliveryOption") != null) {
                String deliveryOption = (String) body.get("deliveryOption");
                if (!isValidDeliveryOption(deliveryOption)) {
                    return ResponseEntity.badRequest().body("Invalid delivery option: " + deliveryOption);
                }
                selection.setDeliveryOption(deliveryOption);
                logger.debug("Updated delivery option: {}", deliveryOption);
            }
            
            if (body.get("paymentMethod") != null) {
                String paymentMethod = (String) body.get("paymentMethod");
                if (!isValidPaymentMethod(paymentMethod)) {
                    return ResponseEntity.badRequest().body("Invalid payment method: " + paymentMethod);
                }
                selection.setPaymentMethod(paymentMethod);
                logger.debug("Updated payment method: {}", paymentMethod);
            }
            
            CheckoutSelection saved = selectionRepo.save(selection);
            logger.info("Checkout selection saved for user: {}", email);
            return ResponseEntity.ok(saved);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for user: {}", email, e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Error saving selection for user: {}", email, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error saving selection for user: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }
    
    /**
     * Validate delivery option
     */
    private boolean isValidDeliveryOption(String option) {
        return option != null && (option.equals("standard") || option.equals("express"));
    }
    
    /**
     * Validate payment method
     */
    private boolean isValidPaymentMethod(String method) {
        return method != null && (method.equals("cod") || method.equals("card") || 
                                 method.equals("upi") || method.equals("wallet"));
    }

    /**
     * Get order review with all checkout details
     * This endpoint is called before placing the order to show final review
     */
    @GetMapping("/review")
    public ResponseEntity<?> review(@RequestParam("email") String email) {
        try {
            logger.debug("Getting order review for user: {}", email);
            
            // 1. Validate user
            User user = requireUser(email);

            // 2. Validate selection exists
            CheckoutSelection selection = selectionRepo.findByUser(user)
                .orElse(null);
            if (selection == null) {
                return ResponseEntity.badRequest().body("No checkout selection found. Please complete checkout steps.");
            }

            // 3. Validate address is selected
            if (selection.getAddressId() == null) {
                return ResponseEntity.badRequest().body("No address selected. Please select a delivery address.");
            }

            // 4. Validate address exists and belongs to user
            Address address = addressRepo.findById(selection.getAddressId())
                .orElse(null);
            if (address == null) {
                return ResponseEntity.badRequest().body("Selected address not found. Please select a valid address.");
            }
            if (!address.getUser().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body("Address does not belong to user.");
            }

            // 5. Validate delivery option is selected
            if (selection.getDeliveryOption() == null || selection.getDeliveryOption().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("No delivery option selected. Please choose delivery method.");
            }

            // 6. Validate payment method is selected
            if (selection.getPaymentMethod() == null || selection.getPaymentMethod().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("No payment method selected. Please choose payment method.");
            }

            // 7. Get cart items
            List<CartItem> cart = cartService.getCart(user);
            if (cart == null || cart.isEmpty()) {
                return ResponseEntity.badRequest().body("Your cart is empty. Please add items before checkout.");
            }

            // 8. Map cart items to DTOs
            List<CartItemDTO> items = cart.stream().map(ci -> {
                CartItemDTO dto = new CartItemDTO();
                dto.id = ci.getId();
                dto.productId = ci.getProduct().getId();
                dto.name = ci.getProduct().getName();
                dto.imageUrl = ci.getProduct().getImageUrl();
                dto.quantity = ci.getQuantity();
                dto.price = ci.getPriceAtAdd();
                dto.lineTotal = (ci.getPriceAtAdd() != null ? ci.getPriceAtAdd() : 0.0) * ci.getQuantity();
                return dto;
            }).collect(Collectors.toList());

            // 9. Calculate totals
            double subtotal = items.stream().mapToDouble(i -> i.lineTotal).sum();
            double shippingFee = "express".equalsIgnoreCase(selection.getDeliveryOption()) ? 100.0 : 50.0;
            double total = subtotal + shippingFee;

            // 10. Build order review DTO
            OrderReviewDTO reviewDTO = new OrderReviewDTO();
            reviewDTO.items = items;
            reviewDTO.address = address;
            reviewDTO.deliveryOption = selection.getDeliveryOption();
            reviewDTO.paymentMethod = selection.getPaymentMethod();
            reviewDTO.subtotal = subtotal;
            reviewDTO.shippingFee = shippingFee;
            reviewDTO.total = total;

            logger.info("Order review generated for user: {} with {} items, total: {}", 
                       email, items.size(), total);
            return ResponseEntity.ok(reviewDTO);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for user: {}", email, e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Error getting review for user: {}", email, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error getting review for user: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }


    /**
     * Place order transactionally
     * This endpoint finalizes the order and clears the cart
     */
    @PostMapping("/place-order")
    @Transactional
    public ResponseEntity<?> placeOrder(@RequestParam("email") String email) {
        try {
            logger.debug("Placing order for user: {}", email);
            
            User user = requireUser(email);
            
            // Validate that all checkout selections are complete
            CheckoutSelection selection = selectionRepo.findByUser(user)
                .orElse(null);
            if (selection == null) {
                return ResponseEntity.badRequest().body("No checkout selection found. Please complete checkout steps.");
            }
            
            if (selection.getAddressId() == null) {
                return ResponseEntity.badRequest().body("No address selected. Please select a delivery address.");
            }
            
            if (selection.getDeliveryOption() == null || selection.getDeliveryOption().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("No delivery option selected. Please choose delivery method.");
            }
            
            if (selection.getPaymentMethod() == null || selection.getPaymentMethod().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("No payment method selected. Please choose payment method.");
            }
            
            // Validate cart is not empty
            List<CartItem> cart = cartService.getCart(user);
            if (cart == null || cart.isEmpty()) {
                return ResponseEntity.badRequest().body("Your cart is empty. Please add items before placing order.");
            }
            
            // Place the order
            Order order = orderService.placeOrder(user);
            
            logger.info("Order placed successfully for user: {} with order ID: {}", email, order.getId());
            return ResponseEntity.ok(order);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for user: {}", email, e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Error placing order for user: {}", email, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error placing order for user: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }
}


