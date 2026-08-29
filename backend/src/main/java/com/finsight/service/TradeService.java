package com.finsight.service;

import com.finsight.model.Holding;
import com.finsight.model.Stock;
import com.finsight.model.Transaction;
import com.finsight.model.Wallet;
import com.finsight.repository.HoldingRepository;
import com.finsight.repository.TransactionRepository;
import com.finsight.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
public class TradeService {

    private final WalletRepository wallets;
    private final HoldingRepository holdings;
    private final TransactionRepository transactions;
    private final MarketDataService market;

    public TradeService(WalletRepository wallets, HoldingRepository holdings,
                        TransactionRepository transactions, MarketDataService market) {
        this.wallets = wallets;
        this.holdings = holdings;
        this.transactions = transactions;
        this.market = market;
    }

    private Wallet getOrCreateWallet(String userId) {
        return wallets.findById(userId).orElseGet(() -> {
            Wallet newWallet = Wallet.builder()
                    .userId(userId)
                    .balance(new BigDecimal("1000000.00")) // Start with ₹10L virtual money
                    .build();
            return wallets.save(newWallet);
        });
    }

    @Transactional
    public Transaction executeBuy(String userId, String symbol, int quantity) {
        Stock stock = market.find(symbol);
        BigDecimal currentPrice = stock.getPrice();
        BigDecimal totalCost = currentPrice.multiply(BigDecimal.valueOf(quantity));

        Wallet wallet = getOrCreateWallet(userId);
        if (wallet.getBalance().compareTo(totalCost) < 0) {
            throw new RuntimeException("Insufficient virtual funds. Requires: ₹" + totalCost);
        }

        // 1. Deduct from Wallet
        wallet.setBalance(wallet.getBalance().subtract(totalCost));
        wallets.save(wallet);

        // 2. Update or Create Holding
        Holding holding = holdings.findByUserId(userId).stream()
                .filter(h -> h.getSymbol().equals(symbol))
                .findFirst()
                .orElse(Holding.builder().userId(userId).symbol(symbol).quantity(BigDecimal.ZERO).averagePrice(BigDecimal.ZERO).build());

        BigDecimal oldTotalValue = holding.getAveragePrice().multiply(holding.getQuantity());
        BigDecimal newTotalQuantity = holding.getQuantity().add(BigDecimal.valueOf(quantity));
        BigDecimal newAveragePrice = (oldTotalValue.add(totalCost)).divide(newTotalQuantity, 2, RoundingMode.HALF_UP);

        holding.setQuantity(newTotalQuantity);
        holding.setAveragePrice(newAveragePrice);
        holdings.save(holding);

        // 3. Log Transaction
        Transaction tx = Transaction.builder()
                .userId(userId).symbol(symbol).transactionType("BUY")
                .quantity(quantity).executionPrice(currentPrice).timestamp(LocalDateTime.now())
                .build();
        return transactions.save(tx);
    }

    @Transactional
    public Transaction executeSell(String userId, String symbol, int quantity) {
        Holding holding = holdings.findByUserId(userId).stream()
                .filter(h -> h.getSymbol().equals(symbol))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("You do not own this stock."));

        if (holding.getQuantity().compareTo(BigDecimal.valueOf(quantity)) < 0) {
            throw new RuntimeException("Insufficient holding quantity.");
        }

        Stock stock = market.find(symbol);
        BigDecimal currentPrice = stock.getPrice();
        BigDecimal totalRevenue = currentPrice.multiply(BigDecimal.valueOf(quantity));

        // 1. Add to Wallet
        Wallet wallet = getOrCreateWallet(userId);
        wallet.setBalance(wallet.getBalance().add(totalRevenue));
        wallets.save(wallet);

        // 2. Reduce or Delete Holding
        BigDecimal newQuantity = holding.getQuantity().subtract(BigDecimal.valueOf(quantity));
        if (newQuantity.compareTo(BigDecimal.ZERO) == 0) {
            holdings.delete(holding);
        } else {
            holding.setQuantity(newQuantity);
            holdings.save(holding);
        }

        // 3. Log Transaction
        Transaction tx = Transaction.builder()
                .userId(userId).symbol(symbol).transactionType("SELL")
                .quantity(quantity).executionPrice(currentPrice).timestamp(LocalDateTime.now())
                .build();
        return transactions.save(tx);
    }
}