package com.eduprajna.service;

import com.eduprajna.entity.*;
import com.eduprajna.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * OrderService handles order creation and management
 * All order operations are transactional to ensure data consistency
 */
@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    
    private final OrderRepository orderRepo;
    private final CartItemRepository cartRepo;
    private final CheckoutSelectionRepository selectionRepo;
    private final AddressRepository addressRepo;
    private final com.eduprajna.repository.ProductRepository productRepo;

    public OrderService(OrderRepository orderRepo, CartItemRepository cartRepo, 
                       CheckoutSelectionRepository selectionRepo, AddressRepository addressRepo,
                       com.eduprajna.repository.ProductRepository productRepo) {
        this.orderRepo = orderRepo;
        this.cartRepo = cartRepo;
        this.selectionRepo = selectionRepo;
        this.addressRepo = addressRepo;
        this.productRepo = productRepo;
    }

    /**
     * Place order transactionally
     * This method creates an order from cart items and clears the cart
     * All operations are wrapped in a transaction for data consistency
     */
    @Transactional
    public Order placeOrder(User user) {
        logger.debug("Placing order for user: {}", user.getEmail());
        
        // 1. Get cart items
        List<CartItem> cart = cartRepo.findByUser(user);
        if (cart.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }
        logger.debug("Found {} items in cart for user: {}", cart.size(), user.getEmail());
        
        // 1b. Validate stock availability for all items before proceeding
        for (CartItem ci : cart) {
            Product product = ci.getProduct();
            int available = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            int qty = ci.getQuantity() != null ? ci.getQuantity() : 0;
            if (qty <= 0) {
                throw new IllegalStateException("Invalid quantity for product: " + product.getName());
            }
            if (available < qty) {
                throw new IllegalStateException("Insufficient stock for product: " + product.getName());
            }
        }
        
        // 2. Get checkout selection
        CheckoutSelection selection = selectionRepo.findByUser(user)
            .orElseThrow(() -> new IllegalStateException("No checkout selection found"));
        
        // 3. Get selected address
        Address address = addressRepo.findById(selection.getAddressId())
            .orElseThrow(() -> new IllegalStateException("Selected address not found"));
        
        // 4. Create order
        Order order = new Order();
        order.setUser(user);
        order.setDeliveryOption(selection.getDeliveryOption());
        order.setPaymentMethod(selection.getPaymentMethod());
        
        // 5. Create shipping snapshot
        ShippingSnapshot shippingSnapshot = new ShippingSnapshot();
        shippingSnapshot.setName(address.getName());
        shippingSnapshot.setPhone(address.getPhone());
        shippingSnapshot.setStreet(address.getStreet());
        shippingSnapshot.setCity(address.getCity());
        shippingSnapshot.setState(address.getState());
        shippingSnapshot.setPincode(address.getPincode());
        shippingSnapshot.setLandmark(address.getLandmark());
        shippingSnapshot.setAddressType(address.getAddressType());
        order.setShipping(shippingSnapshot);
        
        // 6. Calculate totals
        double subtotal = cart.stream()
            .mapToDouble(ci -> (ci.getPriceAtAdd() != null ? ci.getPriceAtAdd() : 0.0) * ci.getQuantity())
            .sum();
        double shippingFee = "express".equalsIgnoreCase(selection.getDeliveryOption()) ? 100.0 : 50.0;
        double total = subtotal + shippingFee;
        
        order.setSubtotal(subtotal);
        order.setShippingFee(shippingFee);
        order.setTotal(total);
        
        // 7. Create order items
        List<OrderItem> orderItems = cart.stream().map(cartItem -> {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPriceAtAdd());
            
            // Decrement stock for the purchased product
            Product product = cartItem.getProduct();
            int available = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
            int qty = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;
            int newQty = Math.max(available - qty, 0);
            product.setStockQuantity(newQty);
            product.setInStock(newQty > 0);
            productRepo.save(product);
            return orderItem;
        }).collect(Collectors.toList());
        order.setItems(orderItems);
        
        // 8. Save order
        Order savedOrder = orderRepo.save(order);
        logger.info("Order created with ID: {} for user: {}", savedOrder.getId(), user.getEmail());
        
        // 9. Clear cart after successful order creation
        cartRepo.deleteByUser(user);
        logger.info("Cart cleared for user: {}", user.getEmail());
        
        // 10. Update user's order count
        user.incrementTotalOrders();
        
        return savedOrder;
    }

    /**
     * Get all orders for a specific user, ordered by creation date (newest first)
     * @param user The user to get orders for
     * @return List of orders for the user
     */
    public List<Order> getUserOrders(User user) { 
        return orderRepo.findByUserOrderByCreatedAtDesc(user); 
    }
    
    /**
     * Get all orders in the system, ordered by creation date (newest first)
     * @return List of all orders
     */
    public List<Order> getAllOrders() { 
        return orderRepo.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .collect(Collectors.toList());
    }
    
    /**
     * Update the status of an order
     * @param orderId The ID of the order to update
     * @param status The new status
     * @return The updated order
     * @throws RuntimeException if order is not found
     */
    public Order updateStatus(Long orderId, String status) {
        Order order = orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        
        String oldStatus = order.getStatus();
        order.setStatus(status);
        Order updatedOrder = orderRepo.save(order);
        
        logger.info("Order {} status updated from '{}' to '{}'", orderId, oldStatus, status);
        return updatedOrder;
    }
    
    /**
     * Get order by ID with all details
     * @param orderId The ID of the order
     * @return The order with all details
     * @throws RuntimeException if order is not found
     */
    public Order getOrderById(Long orderId) {
        return orderRepo.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
    }
    
    /**
     * Get orders by status
     * @param status The status to filter by
     * @return List of orders with the specified status
     */
    public List<Order> getOrdersByStatus(String status) {
        return orderRepo.findByStatusOrderByCreatedAtDesc(status);
    }
    
    /**
     * Get orders for a user by status
     * @param user The user to get orders for
     * @param status The status to filter by
     * @return List of orders for the user with the specified status
     */
    public List<Order> getUserOrdersByStatus(User user, String status) {
        return orderRepo.findByUserAndStatusOrderByCreatedAtDesc(user, status);
    }
    
    /**
     * Get order statistics
     * @return Map containing order statistics
     */
    public java.util.Map<String, Object> getOrderStatistics() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalOrders", orderRepo.count());
        stats.put("pendingOrders", orderRepo.countByStatus("pending"));
        stats.put("shippedOrders", orderRepo.countByStatus("shipped"));
        stats.put("deliveredOrders", orderRepo.countByStatus("delivered"));
        stats.put("totalRevenue", orderRepo.getTotalRevenue());
        return stats;
    }
}
