package com.finsight.controller;

import com.finsight.dto.ApiResponse;
import com.finsight.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "http://localhost:5173")
public class PortfolioController {

    private final PortfolioService portfolio;

    public PortfolioController(PortfolioService portfolio) {
        this.portfolio = portfolio;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<Object>> get(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success("Portfolio fetched successfully", portfolio.summary(userId)));
    }
}