package com.finsight.controller;

import com.finsight.model.User;
import com.finsight.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;

    // In-memory token store: token → username
    private static final Map<String, String> tokenStore = new ConcurrentHashMap<>();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/auth/login
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "").trim();

        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Invalid username or password"
            ));
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString().replace("-", "");
        tokenStore.put(token, user.getUsername());

        return ResponseEntity.ok(Map.of(
            "success", true,
            "token", token,
            "user", Map.of(
                "username",    user.getUsername(),
                "displayName", user.getDisplayName(),
                "email",       user.getEmail() != null ? user.getEmail() : "",
                "role",        user.getRole() != null ? user.getRole() : "INVESTOR"
            )
        ));
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/auth/me   (pass token as query param or header)
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "X-Auth-Token", required = false) String token) {
        if (token == null || !tokenStore.containsKey(token)) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Not authenticated"));
        }
        String username = tokenStore.get(token);
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not found"));
        }
        User user = userOpt.get();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "user", Map.of(
                "username",    user.getUsername(),
                "displayName", user.getDisplayName(),
                "email",       user.getEmail() != null ? user.getEmail() : "",
                "role",        user.getRole() != null ? user.getRole() : "INVESTOR"
            )
        ));
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/auth/logout
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "X-Auth-Token", required = false) String token) {
        if (token != null) tokenStore.remove(token);
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }

    // ─────────────────────────────────────────────────────────────
    // Utility: validate token (used by other controllers optionally)
    // ─────────────────────────────────────────────────────────────
    public static boolean isValidToken(String token) {
        return token != null && tokenStore.containsKey(token);
    }

    public static String getUsernameFromToken(String token) {
        return tokenStore.getOrDefault(token, "demo-user");
    }
}
