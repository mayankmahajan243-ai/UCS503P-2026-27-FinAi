package com.finsight.service;

import com.finsight.model.Holding;
import com.finsight.model.Stock;
import com.finsight.repository.HoldingRepository;
import com.finsight.repository.StockRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final StockRepository stocks;
    private final HoldingRepository holdings;

    public DatabaseSeeder(StockRepository stocks, HoldingRepository holdings) {
        this.stocks = stocks;
        this.holdings = holdings;
    }

    @Override
    public void run(String... args) {
        // 1. Force clear old holdings to ensure a clean slate for the demo
        holdings.deleteAll();

        // 2. Inject realistic portfolio for our demo-user
        holdings.saveAll(List.of(
                Holding.builder().userId("demo-user").symbol("RELIANCE").quantity(new BigDecimal("50")).averagePrice(new BigDecimal("2750.00")).build(),
                Holding.builder().userId("demo-user").symbol("TCS").quantity(new BigDecimal("25")).averagePrice(new BigDecimal("3800.00")).build(),
                Holding.builder().userId("demo-user").symbol("HDFCBANK").quantity(new BigDecimal("120")).averagePrice(new BigDecimal("1520.00")).build()
        ));
        System.out.println("FinSight Engine: Seeded Demo Portfolio successfully!");

        // 3. Seed NIFTY 50 Stocks if the universe is empty
        if (stocks.count() == 0) {
            stocks.saveAll(List.of(
                    Stock.builder().symbol("RELIANCE").companyName("Reliance Industries").sector("Energy").price(new BigDecimal("2900.00")).changePercent(new BigDecimal("1.2")).peRatio(new BigDecimal("28.5")).build(),
                    Stock.builder().symbol("TCS").companyName("Tata Consultancy Services").sector("Technology").price(new BigDecimal("3900.00")).changePercent(new BigDecimal("-0.5")).peRatio(new BigDecimal("30.1")).build(),
                    Stock.builder().symbol("HDFCBANK").companyName("HDFC Bank").sector("Finance").price(new BigDecimal("1600.00")).changePercent(new BigDecimal("0.8")).peRatio(new BigDecimal("18.5")).build(),
                    Stock.builder().symbol("INFY").companyName("Infosys").sector("Technology").price(new BigDecimal("1450.00")).changePercent(new BigDecimal("-1.1")).peRatio(new BigDecimal("22.4")).build(),
                    Stock.builder().symbol("BHARTIARTL").companyName("Bharti Airtel").sector("Telecommunication").price(new BigDecimal("1200.00")).changePercent(new BigDecimal("2.1")).peRatio(new BigDecimal("45.2")).build()
            ));
            System.out.println("FinSight Engine: Seeded NIFTY 50 Universe");
        }
    }
}