package com.eduprajna.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    private String phone;
    
    @Column(nullable = false)
    private String role = "customer"; // "admin" or "customer"
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    private String gender;
    
    @Column(name = "member_since", nullable = false)
    private LocalDate memberSince = LocalDate.now();
    
    @Column(name = "total_orders", nullable = false)
    private Integer totalOrders = 0;

    
    @Column(name = "loyalty_points", nullable = false)
    private Integer loyaltyPoints = 0;
    
    
    @Column(name = "last_password_change")
    private OffsetDateTime lastPasswordChange;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
    
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    // Constructors
    public User() {}

    public User(String name, String email, String passwordHash, String phone) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.memberSince = LocalDate.now();
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { 
        this.name = name;
        this.updatedAt = OffsetDateTime.now();
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { 
        this.email = email;
        this.updatedAt = OffsetDateTime.now();
    }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { 
        this.passwordHash = passwordHash;
        this.lastPasswordChange = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { 
        this.phone = phone;
        this.updatedAt = OffsetDateTime.now();
    }

    public String getRole() { return role; }
    public void setRole(String role) { 
        this.role = role;
        this.updatedAt = OffsetDateTime.now();
    }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { 
        this.dateOfBirth = dateOfBirth;
        this.updatedAt = OffsetDateTime.now();
    }

    public String getGender() { return gender; }
    public void setGender(String gender) { 
        this.gender = gender;
        this.updatedAt = OffsetDateTime.now();
    }

    public LocalDate getMemberSince() { return memberSince; }
    public void setMemberSince(LocalDate memberSince) { this.memberSince = memberSince; }

    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { 
        this.totalOrders = totalOrders;
        this.updatedAt = OffsetDateTime.now();
    }

   

    public Integer getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(Integer loyaltyPoints) { 
        this.loyaltyPoints = loyaltyPoints;
        this.updatedAt = OffsetDateTime.now();
    }

   

    public OffsetDateTime getLastPasswordChange() { return lastPasswordChange; }
    public void setLastPasswordChange(OffsetDateTime lastPasswordChange) { 
        this.lastPasswordChange = lastPasswordChange;
    }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { 
        this.isActive = isActive;
        this.updatedAt = OffsetDateTime.now();
    }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Utility methods
    public void incrementTotalOrders() {
        this.totalOrders++;
        this.updatedAt = OffsetDateTime.now();
    }


    public void addLoyaltyPoints(Integer points) {
        this.loyaltyPoints += points;
        this.updatedAt = OffsetDateTime.now();
    }

  

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}