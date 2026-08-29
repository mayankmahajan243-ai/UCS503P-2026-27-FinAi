package com.finsight.service;

import com.finsight.model.Holding;
import com.finsight.model.Stock;
import com.finsight.model.Wallet;
import com.finsight.repository.HoldingRepository;
import com.finsight.repository.StockRepository;
import com.finsight.repository.WalletRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final StockRepository stocks;
    private final HoldingRepository holdings;
    private final WalletRepository wallets;

    public DatabaseSeeder(StockRepository stocks, HoldingRepository holdings, WalletRepository wallets) {
        this.stocks = stocks;
        this.holdings = holdings;
        this.wallets = wallets;
    }

    @Override
    public void run(String... args) {
        holdings.deleteAll();
        wallets.deleteAll();

        // 1. Seed Virtual Money Wallet
        wallets.save(Wallet.builder().userId("demo-user").balance(new BigDecimal("1000000.00")).build());
        System.out.println("FinSight Engine: Seeded Virtual Wallet with ₹10,00,000");

        // 2. Seed Demo Portfolio
        holdings.saveAll(List.of(
                Holding.builder().userId("demo-user").symbol("RELIANCE").quantity(new BigDecimal("50")).averagePrice(new BigDecimal("2750.00")).build(),
                Holding.builder().userId("demo-user").symbol("TCS").quantity(new BigDecimal("25")).averagePrice(new BigDecimal("3800.00")).build(),
                Holding.builder().userId("demo-user").symbol("HDFCBANK").quantity(new BigDecimal("120")).averagePrice(new BigDecimal("1520.00")).build()
        ));
        System.out.println("FinSight Engine: Seeded Demo Portfolio");

        // 3. Seed Expanded NIFTY Universe
        if (stocks.count() == 0) {
            stocks.saveAll(List.of(
                    Stock.builder().symbol("RELIANCE").companyName("Reliance Industries").sector("Energy").price(new BigDecimal("2900.00")).changePercent(new BigDecimal("1.2")).peRatio(new BigDecimal("28.5")).build(),
                    Stock.builder().symbol("TCS").companyName("Tata Consultancy Services").sector("Technology").price(new BigDecimal("3900.00")).changePercent(new BigDecimal("-0.5")).peRatio(new BigDecimal("30.1")).build(),
                    Stock.builder().symbol("HDFCBANK").companyName("HDFC Bank").sector("Finance").price(new BigDecimal("1600.00")).changePercent(new BigDecimal("0.8")).peRatio(new BigDecimal("18.5")).build(),
                    Stock.builder().symbol("INFY").companyName("Infosys").sector("Technology").price(new BigDecimal("1450.00")).changePercent(new BigDecimal("-1.1")).peRatio(new BigDecimal("22.4")).build(),
                    Stock.builder().symbol("BHARTIARTL").companyName("Bharti Airtel").sector("Telecommunication").price(new BigDecimal("1200.00")).changePercent(new BigDecimal("2.1")).peRatio(new BigDecimal("45.2")).build(),
                    Stock.builder().symbol("ICICIBANK").companyName("ICICI Bank").sector("Finance").price(new BigDecimal("1100.00")).changePercent(new BigDecimal("0.5")).peRatio(new BigDecimal("17.2")).build(),
                    Stock.builder().symbol("SBIN").companyName("State Bank of India").sector("Finance").price(new BigDecimal("750.00")).changePercent(new BigDecimal("1.5")).peRatio(new BigDecimal("10.5")).build(),
                    Stock.builder().symbol("HINDUNILVR").companyName("Hindustan Unilever").sector("Consumer Goods").price(new BigDecimal("2300.00")).changePercent(new BigDecimal("-0.2")).peRatio(new BigDecimal("55.4")).build(),
                    Stock.builder().symbol("ITC").companyName("ITC Limited").sector("Consumer Goods").price(new BigDecimal("420.00")).changePercent(new BigDecimal("0.3")).peRatio(new BigDecimal("25.1")).build(),
                    Stock.builder().symbol("LARSEN").companyName("Larsen & Toubro").sector("Construction").price(new BigDecimal("3500.00")).changePercent(new BigDecimal("1.8")).peRatio(new BigDecimal("38.9")).build(),
                    Stock.builder().symbol("BAJFINANCE").companyName("Bajaj Finance").sector("Finance").price(new BigDecimal("6800.00")).changePercent(new BigDecimal("-1.5")).peRatio(new BigDecimal("35.2")).build(),
                    Stock.builder().symbol("MARUTI").companyName("Maruti Suzuki").sector("Automotive").price(new BigDecimal("12500.00")).changePercent(new BigDecimal("0.9")).peRatio(new BigDecimal("29.8")).build(),
                    Stock.builder().symbol("SUNPHARMA").companyName("Sun Pharmaceutical").sector("Healthcare").price(new BigDecimal("1500.00")).changePercent(new BigDecimal("0.4")).peRatio(new BigDecimal("32.1")).build(),
                    Stock.builder().symbol("TATAMOTORS").companyName("Tata Motors").sector("Automotive").price(new BigDecimal("950.00")).changePercent(new BigDecimal("2.5")).peRatio(new BigDecimal("16.8")).build(),
                    Stock.builder().symbol("ASIANPAINT").companyName("Asian Paints").sector("Consumer Goods").price(new BigDecimal("2800.00")).changePercent(new BigDecimal("-0.8")).peRatio(new BigDecimal("65.2")).build()
            ));
            System.out.println("FinSight Engine: Seeded Expanded NIFTY Universe");
        }
    }
}