package com.finsight.controller;

import com.finsight.service.MarketDataService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:5173")
public class StockController {
    private final MarketDataService market;
    public StockController(MarketDataService market) { this.market = market; }

    @GetMapping
    public List<Map<String,Object>> all() { return market.stocksWithAIScores(); }

    @GetMapping("/{symbol}")
    public Object one(@PathVariable String symbol) { return market.find(symbol); }
}
