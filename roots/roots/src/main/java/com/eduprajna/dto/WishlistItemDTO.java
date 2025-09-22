package com.eduprajna.dto;

import java.time.OffsetDateTime;

public class WishlistItemDTO {
    public Long productId;
    public String productName;
    public String productImage;
    public Double productPrice;
    public OffsetDateTime createdAt;
    public Boolean inStock;
    public Integer stockQuantity;
    public String category;
    public String brand;
}
