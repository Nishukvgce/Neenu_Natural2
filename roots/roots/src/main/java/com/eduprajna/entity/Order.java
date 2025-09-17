package com.eduprajna.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Embedded
    private ShippingSnapshot shipping;

    @Column(nullable = false)
    private String deliveryOption; // standard, express

    @Column(nullable = false)
    private String paymentMethod; // cod, card, upi, wallet

    @Column(nullable = false)
    private String status = "pending";

    @Column(nullable = false)
    private Double subtotal;

    @Column(nullable = false)
    private Double shippingFee;

    @Column(nullable = false)
    private Double total;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
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


