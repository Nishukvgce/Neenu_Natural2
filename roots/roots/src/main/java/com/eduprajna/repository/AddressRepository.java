package com.eduprajna.repository;

import com.eduprajna.entity.Address;
import com.eduprajna.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(User user);
}


