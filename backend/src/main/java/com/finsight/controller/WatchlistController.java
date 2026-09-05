package com.finsight.controller;

import com.finsight.model.WatchlistItem;
import com.finsight.repository.WatchlistRepository;
import com.finsight.service.MarketDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    private final WatchlistRepository repo;
    private final MarketDataService market;

    public WatchlistController(WatchlistRepository repo, MarketDataService market) {
        this.repo = repo;
        this.market = market;
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/watchlist/{userId}/names
    // Returns list of all watchlist names for user (e.g. ["Default", "Tech Titans"])
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/{userId}/names")
    public List<String> getWatchlistNames(@PathVariable String userId) {
        List<String> names = repo.findWatchlistNamesByUserId(userId);
        if (names == null || names.isEmpty()) {
            return List.of("Default");
        }
        // Ensure "Default" is at the front if present
        List<String> sorted = new ArrayList<>(names);
        if (sorted.contains("Default")) {
            sorted.remove("Default");
            sorted.add(0, "Default");
        }
        return sorted;
    }

    // ─────────────────────────────────────────────────────────────
    // GET /api/watchlist/{userId}?name=Default
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/{userId}")
    public List<Map<String, Object>> get(
            @PathVariable String userId,
            @RequestParam(defaultValue = "Default") String name) {

        String listName = (name == null || name.trim().isEmpty()) ? "Default" : name.trim();
        List<WatchlistItem> items = repo.findByUserIdAndWatchlistName(userId, listName);

        List<Map<String, Object>> allStocks = market.stocksWithAIScores();

        return items.stream()
                .filter(w -> w.getSymbol() != null && !w.getSymbol().isBlank() && !w.getSymbol().equals("_INIT_"))
                .map(w -> allStocks.stream()
                        .filter(s -> s.get("symbol").equals(w.getSymbol()))
                        .findFirst()
                        .orElse(Map.of("symbol", w.getSymbol())))
                .toList();
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/watchlist/{userId}?symbol=RELIANCE&name=Default
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/{userId}")
    public ResponseEntity<?> add(
            @PathVariable String userId,
            @RequestParam String symbol,
            @RequestParam(defaultValue = "Default") String name) {

        String sym = symbol.toUpperCase().trim();
        String listName = (name == null || name.trim().isEmpty()) ? "Default" : name.trim();

        // Check if already in this specific watchlist
        Optional<WatchlistItem> existing = repo.findByUserIdAndSymbolAndWatchlistName(userId, sym, listName);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of("message", sym + " already in " + listName + " watchlist"));
        }

        // Clean up _INIT_ marker if present when adding the first real stock
        repo.deleteByUserIdAndSymbolAndWatchlistName(userId, "_INIT_", listName);

        WatchlistItem item = repo.save(WatchlistItem.builder()
                .userId(userId)
                .symbol(sym)
                .watchlistName(listName)
                .build());

        return ResponseEntity.ok(item);
    }

    // ─────────────────────────────────────────────────────────────
    // POST /api/watchlist/{userId}/create?name=Tech%20Titans
    // Creates a new empty named watchlist group
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/{userId}/create")
    public ResponseEntity<?> createGroup(
            @PathVariable String userId,
            @RequestParam String name) {

        String listName = name != null ? name.trim() : "";
        if (listName.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Watchlist name cannot be empty"));
        }

        List<String> existingNames = repo.findWatchlistNamesByUserId(userId);
        if (existingNames.stream().anyMatch(n -> n.equalsIgnoreCase(listName))) {
            return ResponseEntity.ok(Map.of("message", "Watchlist '" + listName + "' already exists", "name", listName));
        }

        // Save a placeholder item so the name persists
        repo.save(WatchlistItem.builder()
                .userId(userId)
                .symbol("_INIT_")
                .watchlistName(listName)
                .build());

        return ResponseEntity.ok(Map.of("success", true, "message", "Created watchlist " + listName, "name", listName));
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE /api/watchlist/{userId}/{symbol}?name=Default
    // ─────────────────────────────────────────────────────────────
    @DeleteMapping("/{userId}/{symbol}")
    public ResponseEntity<?> remove(
            @PathVariable String userId,
            @PathVariable String symbol,
            @RequestParam(defaultValue = "Default") String name) {

        String sym = symbol.toUpperCase().trim();
        String listName = (name == null || name.trim().isEmpty()) ? "Default" : name.trim();

        repo.deleteByUserIdAndSymbolAndWatchlistName(userId, sym, listName);
        return ResponseEntity.ok(Map.of("message", sym + " removed from " + listName));
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE /api/watchlist/{userId}/group/{name}
    // Deletes an entire watchlist group
    // ─────────────────────────────────────────────────────────────
    @DeleteMapping("/{userId}/group/{name}")
    public ResponseEntity<?> deleteGroup(
            @PathVariable String userId,
            @PathVariable String name) {

        String listName = (name == null || name.trim().isEmpty()) ? "Default" : name.trim();

        if (listName.equalsIgnoreCase("Default")) {
            // Clear default watchlist instead of removing the group completely
            repo.deleteByUserIdAndWatchlistName(userId, "Default");
            return ResponseEntity.ok(Map.of("message", "Default watchlist cleared"));
        }

        repo.deleteByUserIdAndWatchlistName(userId, listName);
        return ResponseEntity.ok(Map.of("message", "Watchlist '" + listName + "' deleted"));
    }
}
