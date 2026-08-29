package com.finsight.controller;

import com.finsight.dto.ApiResponse;
import com.finsight.service.MarketDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:5173")
public class StockController {

    private final MarketDataService market;

    public StockController(MarketDataService market) {
        this.market = market;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String,Object>>>> all() {
        return ResponseEntity.ok(ApiResponse.success("Stocks fetched successfully", market.stocksWithAIScores()));
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<ApiResponse<Object>> one(@PathVariable String symbol) {
        return ResponseEntity.ok(ApiResponse.success("Stock details fetched", market.find(symbol)));
    }
}