package com.eduprajna.repository;

import com.eduprajna.entity.CheckoutSelection;
import com.eduprajna.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CheckoutSelectionRepository extends JpaRepository<CheckoutSelection, Long> {
    Optional<CheckoutSelection> findByUser(User user);
}


