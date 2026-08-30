package com.finsight.controller;

import com.finsight.model.Wallet;
import com.finsight.repository.WalletRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@CrossOrigin(origins = "http://localhost:5173")
public class WalletController {

    private final WalletRepository walletRepository;

    public WalletController(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getWallet(@PathVariable String userId) {
        Wallet wallet = walletRepository.findById(userId)
                .orElseGet(() -> Wallet.builder()
                        .userId(userId)
                        .balance(new BigDecimal("1000000.00"))
                        .build());
        return ResponseEntity.ok(Map.of(
                "userId", wallet.getUserId(),
                "balance", wallet.getBalance()
        ));
    }
}
