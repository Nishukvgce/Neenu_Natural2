package com.eduprajna.dto;

import java.util.List;

public class OrderReviewDTO {
  public List<CartItemDTO> items;
  public Object address;
  public String deliveryOption;
  public String paymentMethod;
  public Double subtotal;
  public Double shippingFee;
  public Double total;
}


