package com.eduprajna.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "addresses")
public class Address {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String phone;

  @Column(nullable = false)
  private String street;

  @Column(nullable = false)
  private String city;

  @Column(nullable = false)
  private String state;

  @Column(nullable = false, length = 6)
  private String pincode;

  @Column
  private String landmark;

  @Column(nullable = false)
  private String addressType; // Home | Work | Other

  @Column(nullable = false)
  private boolean isDefault = false;

  // getters and setters
  public Long getId() {
      return id;
  }

  public void setId(Long id) {
      this.id = id;
  }

  public User getUser() {
      return user;
  }

  public void setUser(User user) {
      this.user = user;
  }

  public String getName() {
      return name;
  }

  public void setName(String name) {
      this.name = name;
  }

  public String getPhone() {
      return phone;
  }

  public void setPhone(String phone) {
      this.phone = phone;
  }

  public String getStreet() {
      return street;
  }

  public void setStreet(String street) {
      this.street = street;
  }

  public String getCity() {
      return city;
  }

  public void setCity(String city) {
      this.city = city;
  }

  public String getState() {
      return state;
  }

  public void setState(String state) {
      this.state = state;
  }

  public String getPincode() {
      return pincode;
  }

  public void setPincode(String pincode) {
      this.pincode = pincode;
  }

  public String getLandmark() {
      return landmark;
  }

  public void setLandmark(String landmark) {
      this.landmark = landmark;
  }

  public String getAddressType() {
      return addressType;
  }

  public void setAddressType(String addressType) {
      this.addressType = addressType;
  }

  public boolean isDefault() {
      return isDefault;
  }

  public void setDefault(boolean aDefault) {
      isDefault = aDefault;
  }
}