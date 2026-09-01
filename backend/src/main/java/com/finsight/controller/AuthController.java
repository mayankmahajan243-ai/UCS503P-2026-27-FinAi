package com.finsight.controller;

import com.finsight.model.User;
import com.finsight.repository.UserRepository;
import com.finsight.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "").trim();

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Invalid username or password"
            ));
        }

        User user = userOpt.get();
        boolean passwordMatches = false;
        String storedPassword = user.getPassword();

        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            passwordMatches = passwordEncoder.matches(password, storedPassword);
        } else {
            // Plain-text match fallback (e.g. from previous seeder) + auto-upgrade to BCrypt
            if (storedPassword.equals(password)) {
                passwordMatches = true;
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            }
        }

        if (!passwordMatches) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Invalid username or password"
            ));
        }
        String token = jwtService.generateToken(user.getUsername(), Map.of(
                "displayName", user.getDisplayName() != null ? user.getDisplayName() : "",
                "role", user.getRole() != null ? user.getRole() : "INVESTOR"
        ));

        return ResponseEntity.ok(Map.of(
            "success", true,
            "token", token,
            "user", Map.of(
                "username",    user.getUsername(),
                "displayName", user.getDisplayName() != null ? user.getDisplayName() : "",
                "email",       user.getEmail() != null ? user.getEmail() : "",
                "role",        user.getRole() != null ? user.getRole() : "INVESTOR"
            )
        ));
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/auth/me   (authenticated via JWT)
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
        }
        Optional<User> userOpt = userRepository.findByUsername(principal.getName());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not found"));
        }
        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "user", Map.of(
                "username",    user.getUsername(),
                "displayName", user.getDisplayName() != null ? user.getDisplayName() : "",
                "email",       user.getEmail() != null ? user.getEmail() : "",
                "role",        user.getRole() != null ? user.getRole() : "INVESTOR"
            )
        ));
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/auth/logout  (stateless — client discards token)
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully. Discard your token."));
    }
}
