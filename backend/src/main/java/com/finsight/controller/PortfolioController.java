package com.finsight.controller;

import com.finsight.service.PortfolioService;
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
    public Object get(@PathVariable String userId) {
        // Returning raw data temporarily so the current React frontend can read it
        return portfolio.summary(userId);
    }
}