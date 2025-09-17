package com.eduprajna.dto;

import com.eduprajna.entity.OrderItem;
import com.eduprajna.entity.Product;

/**
 * Data Transfer Object for OrderItem entity
 * Prevents circular references and lazy loading issues in JSON serialization
 */
public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private Double productPrice;
    private Integer quantity;
    private Double price; // Price at time of order

    // Default constructor
    public OrderItemDTO() {}

    // Constructor from OrderItem entity
    public OrderItemDTO(OrderItem orderItem) {
        this.id = orderItem.getId();
        this.quantity = orderItem.getQuantity();
        this.price = orderItem.getPrice();
        
        // Handle product information safely
        if (orderItem.getProduct() != null) {
            Product product = orderItem.getProduct();
            this.productId = product.getId();
            this.productName = product.getName();
            this.productImage = product.getImageUrl();
            this.productPrice = product.getPrice() != null ? product.getPrice().doubleValue() : 0.0;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    
    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }
    
    public Double getProductPrice() { return productPrice; }
    public void setProductPrice(Double productPrice) { this.productPrice = productPrice; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
}
