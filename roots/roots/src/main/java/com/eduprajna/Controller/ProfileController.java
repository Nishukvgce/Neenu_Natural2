package com.eduprajna.Controller;

import com.eduprajna.dto.PasswordUpdateRequest;
import com.eduprajna.dto.ProfileDTO;
import com.eduprajna.entity.User;
import com.eduprajna.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class ProfileController {
    private final UserService userService;
    public ProfileController(UserService userService) { this.userService = userService; }

    // In a real app, derive email/userId from JWT. Here we accept email param for simplicity.
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam("email") String email) {
        return userService.findByEmail(email)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(toProfileDTO(user)))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    @PostMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestParam("email") String email,
                                            @Valid @RequestBody PasswordUpdateRequest req) {
        return userService.findByEmail(email).map(user -> {
            // For demo: compare plain text. In production, verify hash.
            if (user.getPasswordHash() == null || !user.getPasswordHash().equals(req.getCurrentPassword())) {
                return ResponseEntity.status(400).body(Map.of("message", "Current password is incorrect"));
            }
            user.setPasswordHash(req.getNewPassword());
            // Optionally track last password change if field exists (not in entity now)
            userService.save(user);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        }).orElseGet(() -> ResponseEntity.status(404).body(Map.of("message", "User not found")));
    }

    private ProfileDTO toProfileDTO(User u) {
        ProfileDTO dto = new ProfileDTO();
        dto.id = u.getId();
        dto.name = u.getName();
        dto.email = u.getEmail();
        dto.phone = u.getPhone();
        // Frontend expects optional fields; fill with nulls/defaults where backend lacks columns
        dto.dateOfBirth = null;
        dto.gender = null;
        dto.memberSince = null; // not tracked in User; frontend handles formatting
        dto.lastPasswordChange = null; // not tracked currently
        dto.totalOrders = 0;
        dto.totalSpent = 0.0;
        dto.loyaltyPoints = 0;
        dto.totalSaved = 0.0;
        return dto;
    }
}


