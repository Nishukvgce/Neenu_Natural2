package com.eduprajna.Controller;

import com.eduprajna.dto.OrderDTO;
import com.eduprajna.entity.Order;
import com.eduprajna.entity.User;
import com.eduprajna.service.OrderService;
import com.eduprajna.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * OrdersController handles order-related API endpoints
 * Provides endpoints for both user order history and admin order management
 */
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrdersController {
    private static final Logger logger = LoggerFactory.getLogger(OrdersController.class);
    
    private final OrderService orderService;
    private final UserService userService;

    public OrdersController(OrderService orderService, UserService userService) {
        this.orderService = orderService;
        this.userService = userService;
    }

    /**
     * Get all orders for a specific user
     * @param email User's email address
     * @return List of user's orders or error message
     */
    @GetMapping("/user")
    public ResponseEntity<?> getUserOrders(@RequestParam("email") String email) {
        try {
            logger.debug("Getting orders for user: {}", email);
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            
            User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
            
            List<Order> orders = orderService.getUserOrders(user);
            logger.info("Retrieved {} orders for user: {}", orders.size(), email);
            
            // Convert to DTOs to avoid circular references
            List<OrderDTO> orderDTOs = orders.stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(orderDTOs);
            
        } catch (RuntimeException e) {
            logger.error("Error getting orders for user: {}", email, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error getting orders for user: {}", email, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Get all orders in the system (admin only)
     * @return List of all orders
     */
    @GetMapping("/admin")
    public ResponseEntity<?> getAllOrders() {
        try {
            logger.debug("Getting all orders for admin");
            List<Order> orders = orderService.getAllOrders();
            logger.info("Retrieved {} total orders", orders.size());
            
            // Convert to DTOs to avoid circular references
            List<OrderDTO> orderDTOs = orders.stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(orderDTOs);
        } catch (Exception e) {
            logger.error("Error getting all orders", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Update the status of an order (admin only)
     * @param orderId ID of the order to update
     * @param body Request body containing the new status
     * @return Updated order or error message
     */
    @PostMapping("/admin/{orderId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long orderId, @RequestBody Map<String, String> body) {
        try {
            logger.debug("Updating status for order: {}", orderId);
            
            if (orderId == null || orderId <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid order ID"));
            }
            
            String newStatus = body.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            // Validate status values
            List<String> validStatuses = List.of("pending", "processing", "shipped", "delivered", "cancelled");
            if (!validStatuses.contains(newStatus.toLowerCase())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status. Valid statuses: " + validStatuses));
            }
            
            Order updatedOrder = orderService.updateStatus(orderId, newStatus.toLowerCase());
            logger.info("Successfully updated order {} status to {}", orderId, newStatus);
            
            // Convert to DTO to avoid circular references
            OrderDTO orderDTO = new OrderDTO(updatedOrder);
            
            return ResponseEntity.ok(orderDTO);
            
        } catch (RuntimeException e) {
            logger.error("Error updating status for order: {}", orderId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error updating status for order: {}", orderId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Get a specific order by ID
     * @param orderId ID of the order
     * @return Order details or error message
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        try {
            logger.debug("Getting order by ID: {}", orderId);
            
            if (orderId == null || orderId <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid order ID"));
            }
            
            Order order = orderService.getOrderById(orderId);
            logger.info("Retrieved order: {}", orderId);
            
            // Convert to DTO to avoid circular references
            OrderDTO orderDTO = new OrderDTO(order);
            
            return ResponseEntity.ok(orderDTO);
            
        } catch (RuntimeException e) {
            logger.error("Error getting order: {}", orderId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error getting order: {}", orderId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Get orders by status (admin only)
     * @param status Status to filter by
     * @return List of orders with the specified status
     */
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String status) {
        try {
            logger.debug("Getting orders by status: {}", status);
            
            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            List<Order> orders = orderService.getOrdersByStatus(status.toLowerCase());
            logger.info("Retrieved {} orders with status: {}", orders.size(), status);
            
            // Convert to DTOs to avoid circular references
            List<OrderDTO> orderDTOs = orders.stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(orderDTOs);
            
        } catch (Exception e) {
            logger.error("Error getting orders by status: {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Get order statistics (admin only)
     * @return Order statistics
     */
    @GetMapping("/admin/statistics")
    public ResponseEntity<?> getOrderStatistics() {
        try {
            logger.debug("Getting order statistics");
            Map<String, Object> statistics = orderService.getOrderStatistics();
            logger.info("Retrieved order statistics");
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            logger.error("Error getting order statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Internal server error"));
        }
    }
}


