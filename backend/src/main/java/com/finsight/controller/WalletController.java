package com.finsight.controller;

import com.finsight.model.Wallet;
import com.finsight.repository.WalletRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
public class WalletController {

    private final WalletRepository walletRepository;

    public WalletController(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getWallet(@PathVariable String userId) {
        Wallet wallet = walletRepository.findById(userId)
                .orElseGet(() -> {
                    Wallet w = Wallet.builder()
                            .userId(userId)
                            .balance(new BigDecimal("1000000.00"))
                            .build();
                    return walletRepository.save(w);
                });
        return ResponseEntity.ok(Map.of(
                "userId", wallet.getUserId(),
                "balance", wallet.getBalance()
        ));
    }

    @PostMapping("/{userId}/deposit")
    public ResponseEntity<?> deposit(@PathVariable String userId, @RequestBody Map<String, Object> body) {
        double amount = 100000.0;
        if (body != null && body.containsKey("amount")) {
            try {
                amount = Double.parseDouble(body.get("amount").toString());
            } catch (Exception ignored) {}
        }
        Wallet wallet = walletRepository.findById(userId)
                .orElseGet(() -> Wallet.builder().userId(userId).balance(new BigDecimal("1000000.00")).build());
        wallet.setBalance(wallet.getBalance().add(BigDecimal.valueOf(amount)));
        walletRepository.save(wallet);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Deposited ₹" + amount + " virtual cash successfully.",
                "balance", wallet.getBalance()
        ));
    }

    @PostMapping("/{userId}/reset")
    public ResponseEntity<?> reset(@PathVariable String userId) {
        Wallet wallet = walletRepository.findById(userId)
                .orElseGet(() -> Wallet.builder().userId(userId).balance(new BigDecimal("1000000.00")).build());
        wallet.setBalance(new BigDecimal("1000000.00"));
        walletRepository.save(wallet);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Wallet reset to ₹10,00,000.00 virtual cash.",
                "balance", wallet.getBalance()
        ));
    }
}
