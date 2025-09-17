package com.eduprajna.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;            

public class ProfileDTO {
  public Long id;
  public String name;
  public String email;
  public String phone;
  public LocalDate dateOfBirth;
  public String gender;
  public LocalDate memberSince;
  public OffsetDateTime lastPasswordChange;

  public Integer totalOrders;
  public Double totalSpent;
  public Integer loyaltyPoints;
  public Double totalSaved;
}