package com.eduprajna.Controller;

import com.eduprajna.entity.Address;
import com.eduprajna.service.AddressService;
import com.eduprajna.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "*")
public class AddressController {
    private final AddressService addressService;
    private final UserService userService;

    public AddressController(AddressService addressService, UserService userService) {
        this.addressService = addressService;
        this.userService = userService;
    }

    // In a real app, resolve current user from JWT; here via email param
    @GetMapping
    public ResponseEntity<?> list(@RequestParam("email") String email) {
        return userService.findByEmail(email)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(addressService.getUserAddresses(user)))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestParam("email") String email, @Valid @RequestBody Address body) {
        return userService.findByEmail(email)
                .<ResponseEntity<?>>map(user -> {
                    body.setId(null);
                    body.setUser(user);
                    Address saved = addressService.save(body);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@RequestParam("email") String email, @PathVariable Long id, @Valid @RequestBody Address body) {
        return userService.findByEmail(email)
            .<ResponseEntity<Object>>map(user ->
                addressService.findById(id)
                    .<ResponseEntity<Object>>map(existing -> {
                        if (existing.getUser() == null || !existing.getUser().getId().equals(user.getId())) {
                            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
                        }
                        existing.setName(body.getName());
                        existing.setPhone(body.getPhone());
                        existing.setStreet(body.getStreet());
                        existing.setCity(body.getCity());
                        existing.setState(body.getState());
                        existing.setPincode(body.getPincode());
                        existing.setLandmark(body.getLandmark());
                        existing.setAddressType(body.getAddressType());
                        existing.setDefault(body.isDefault());
                        return ResponseEntity.ok(addressService.save(existing));
                    })
                    .orElse(ResponseEntity.status(404).body(Map.of("message", "Address not found")))
            )
            .orElse(ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@RequestParam("email") String email, @PathVariable Long id) {
        return userService.findByEmail(email)
            .<ResponseEntity<Object>>map(user ->
                addressService.findById(id)
                    .<ResponseEntity<Object>>map(existing -> {
                        if (existing.getUser() == null || !existing.getUser().getId().equals(user.getId())) {
                            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
                        }
                        addressService.deleteById(id);
                        return ResponseEntity.status(204).body(null);
                    })
                    .orElse(ResponseEntity.status(404).body(Map.of("message", "Address not found")))
            )
            .orElse(ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }
}


