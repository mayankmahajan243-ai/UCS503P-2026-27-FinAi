package com.finsight.controller;

import com.finsight.model.WatchlistItem;
import com.finsight.repository.WatchlistRepository;
import com.finsight.service.MarketDataService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin(origins = "http://localhost:5173")
public class WatchlistController {
    private final WatchlistRepository repo;
    private final MarketDataService market;
    public WatchlistController(WatchlistRepository repo, MarketDataService market) { this.repo = repo; this.market = market; }

    @GetMapping("/{userId}")
    public List<Map<String,Object>> get(@PathVariable String userId) {
        return repo.findByUserId(userId).stream().map(w -> market.stocksWithAIScores().stream()
            .filter(s -> s.get("symbol").equals(w.getSymbol())).findFirst().orElse(Map.of())).toList();
    }

    @PostMapping("/{userId}")
    public WatchlistItem add(@PathVariable String userId, @RequestParam String symbol) {
        return repo.save(WatchlistItem.builder().userId(userId).symbol(symbol.toUpperCase()).build());
    }
}
