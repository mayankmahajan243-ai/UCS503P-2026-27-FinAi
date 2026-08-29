package com.finsight.controller;

import com.finsight.dto.ApiResponse;
import com.finsight.dto.TradeRequest;
import com.finsight.model.Transaction;
import com.finsight.service.TradeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trade")
@CrossOrigin(origins = "http://localhost:5173")
public class TradeController {

    private final TradeService tradeService;

    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @PostMapping("/buy")
    public ResponseEntity<ApiResponse<Transaction>> buy(@Valid @RequestBody TradeRequest request) {
        Transaction tx = tradeService.executeBuy(request.getUserId(), request.getSymbol(), request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Successfully bought " + request.getQuantity() + " shares of " + request.getSymbol(), tx));
    }

    @PostMapping("/sell")
    public ResponseEntity<ApiResponse<Transaction>> sell(@Valid @RequestBody TradeRequest request) {
        Transaction tx = tradeService.executeSell(request.getUserId(), request.getSymbol(), request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Successfully sold " + request.getQuantity() + " shares of " + request.getSymbol(), tx));
    }
}