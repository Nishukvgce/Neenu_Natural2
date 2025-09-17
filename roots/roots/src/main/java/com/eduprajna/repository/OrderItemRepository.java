package com.eduprajna.repository;

import com.eduprajna.entity.OrderItem;
import com.eduprajna.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for OrderItem entity
 * Provides database operations for order items
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    /**
     * Find all order items for a specific order
     * @param order The order to find items for
     * @return List of order items
     */
    List<OrderItem> findByOrder(Order order);
    
    /**
     * Find all order items for a specific order by order ID
     * @param orderId The ID of the order
     * @return List of order items
     */
    List<OrderItem> findByOrderId(Long orderId);
}
