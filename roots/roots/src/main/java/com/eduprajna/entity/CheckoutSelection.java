package com.eduprajna.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "checkout_selections")
public class CheckoutSelection {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column
    private Long addressId; // selected Address id

    @Column(nullable = false)
    private String deliveryOption; // standard, express

    @Column(nullable = false)
    private String paymentMethod; // cod, card, upi, wallet

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Long getAddressId() { return addressId; }
    public void setAddressId(Long addressId) { this.addressId = addressId; }
    public String getDeliveryOption() { return deliveryOption; }
    public void setDeliveryOption(String deliveryOption) { this.deliveryOption = deliveryOption; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}


