package com.eduprajna.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.eduprajna.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {}
// CategoryRepository.java, UserRepository.java, OrderRepository.java, OrderItemRepository.java