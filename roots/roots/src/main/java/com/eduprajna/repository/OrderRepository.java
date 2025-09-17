package com.eduprajna.repository;

import com.eduprajna.entity.Order;
import com.eduprajna.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Repository for Order entity
 * Provides database operations for orders with additional query methods
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    /**
     * Find all orders for a specific user
     * @param user The user to find orders for
     * @return List of orders ordered by creation date (newest first)
     */
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find all orders for a specific user (legacy method for backward compatibility)
     * @param user The user to find orders for
     * @return List of orders
     */
    List<Order> findByUser(User user);
    
    /**
     * Find all orders with a specific status
     * @param status The status to filter by
     * @return List of orders with the specified status
     */
    List<Order> findByStatusOrderByCreatedAtDesc(String status);
    
    /**
     * Find all orders created between two dates
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of orders created in the date range
     */
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(OffsetDateTime startDate, OffsetDateTime endDate);
    
    /**
     * Find all orders for a specific user with a specific status
     * @param user The user to find orders for
     * @param status The status to filter by
     * @return List of orders matching both criteria
     */
    List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, String status);
    
    /**
     * Count orders by status
     * @param status The status to count
     * @return Number of orders with the specified status
     */
    long countByStatus(String status);
    
    /**
     * Get total revenue from all orders
     * @return Sum of all order totals
     */
    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o")
    Double getTotalRevenue();
    
    /**
     * Get total revenue from orders in a date range
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return Sum of order totals in the date range
     */
    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalRevenueBetween(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);
}


