package com.eduprajna.dto;

import com.eduprajna.entity.Order;
import com.eduprajna.entity.OrderItem;
import com.eduprajna.entity.ShippingSnapshot;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Data Transfer Object for Order entity
 * Prevents circular references and lazy loading issues in JSON serialization
 */
public class OrderDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private List<OrderItemDTO> items;
    private ShippingSnapshot shipping;
    private String deliveryOption;
    private String paymentMethod;
    private String status;
    private Double subtotal;
    private Double shippingFee;
    private Double total;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;

    // Default constructor
    public OrderDTO() {}

    // Constructor from Order entity
    public OrderDTO(Order order) {
        this.id = order.getId();
        this.userId = order.getUser() != null ? order.getUser().getId() : null;
        this.userEmail = order.getUser() != null ? order.getUser().getEmail() : null;
        this.userName = order.getUser() != null ? order.getUser().getName() : null;
        this.shipping = order.getShipping();
        this.deliveryOption = order.getDeliveryOption();
        this.paymentMethod = order.getPaymentMethod();
        this.status = order.getStatus();
        this.subtotal = order.getSubtotal();
        this.shippingFee = order.getShippingFee();
        this.total = order.getTotal();
        this.createdAt = order.getCreatedAt();
        
        // Convert OrderItems to DTOs
        if (order.getItems() != null) {
            this.items = order.getItems().stream()
                .map(OrderItemDTO::new)
                .collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public List<OrderItemDTO> getItems() { return items; }
    public void setItems(List<OrderItemDTO> items) { this.items = items; }
    
    public ShippingSnapshot getShipping() { return shipping; }
    public void setShipping(ShippingSnapshot shipping) { this.shipping = shipping; }
    
    public String getDeliveryOption() { return deliveryOption; }
    public void setDeliveryOption(String deliveryOption) { this.deliveryOption = deliveryOption; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
    
    public Double getShippingFee() { return shippingFee; }
    public void setShippingFee(Double shippingFee) { this.shippingFee = shippingFee; }
    
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
