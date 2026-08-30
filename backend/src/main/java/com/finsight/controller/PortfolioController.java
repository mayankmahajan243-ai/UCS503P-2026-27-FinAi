package com.finsight.controller;

import com.finsight.repository.TransactionRepository;
import com.finsight.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "http://localhost:5173")
public class PortfolioController {

    private final PortfolioService portfolio;
    private final TransactionRepository transactionRepository;

    public PortfolioController(PortfolioService portfolio, TransactionRepository transactionRepository) {
        this.portfolio = portfolio;
        this.transactionRepository = transactionRepository;
    }

    // GET /api/portfolio/{userId}
    @GetMapping("/{userId}")
    public Object get(@PathVariable String userId) {
        return portfolio.summary(userId);
    }

    // GET /api/portfolio/{userId}/transactions
    @GetMapping("/{userId}/transactions")
    public ResponseEntity<?> transactions(@PathVariable String userId) {
        return ResponseEntity.ok(transactionRepository.findByUserIdOrderByTimestampDesc(userId));
    }
}