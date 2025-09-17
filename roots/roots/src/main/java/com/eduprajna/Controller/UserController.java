package com.eduprajna.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.eduprajna.entity.User;
import com.eduprajna.repository.UserRepository;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("")
    @ResponseBody
    public List<User> getAllUsers() {
        // Fetch only users whose role is not 'admin'
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == null || !user.getRole().equalsIgnoreCase("admin"))
                .toList();
    }
}