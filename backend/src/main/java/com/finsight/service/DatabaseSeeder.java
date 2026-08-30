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

        // 1. Seed Virtual Money Wallet (₹10L)
        wallets.save(Wallet.builder().userId("demo-user").balance(new BigDecimal("1000000.00")).build());
        System.out.println("FinSight Engine: Seeded Virtual Wallet with ₹10,00,000");

        // 2. Seed Demo Portfolio
        holdings.saveAll(List.of(
                Holding.builder().userId("demo-user").symbol("RELIANCE").quantity(new BigDecimal("100")).averagePrice(new BigDecimal("1285.00")).build(),
                Holding.builder().userId("demo-user").symbol("TCS").quantity(new BigDecimal("50")).averagePrice(new BigDecimal("2340.00")).build(),
                Holding.builder().symbol("HDFCBANK").quantity(new BigDecimal("150")).averagePrice(new BigDecimal("1600.00")).build()
        ));
        System.out.println("FinSight Engine: Seeded Demo Portfolio");

        // 3. Seed Comprehensive Nifty & Sensex Universe (All Major Stocks)
        stocks.deleteAll();
        stocks.saveAll(List.of(
                // --- SENSEX & NIFTY HEAVYWEIGHTS ---
                Stock.builder().symbol("RELIANCE").companyName("Reliance Industries Ltd").sector("Energy").price(new BigDecimal("1287.00")).changePercent(new BigDecimal("0.37")).peRatio(new BigDecimal("23.2")).roe(new BigDecimal("12.4")).debtToEquity(new BigDecimal("0.4")).build(),
                Stock.builder().symbol("TCS").companyName("Tata Consultancy Services Ltd").sector("Technology").price(new BigDecimal("2342.00")).changePercent(new BigDecimal("4.17")).peRatio(new BigDecimal("17.0")).roe(new BigDecimal("61.5")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("HDFCBANK").companyName("HDFC Bank Ltd").sector("Finance").price(new BigDecimal("1600.00")).changePercent(new BigDecimal("0.80")).peRatio(new BigDecimal("18.5")).roe(new BigDecimal("16.8")).debtToEquity(new BigDecimal("1.2")).build(),
                Stock.builder().symbol("ICICIBANK").companyName("ICICI Bank Ltd").sector("Finance").price(new BigDecimal("1100.00")).changePercent(new BigDecimal("0.50")).peRatio(new BigDecimal("17.2")).roe(new BigDecimal("17.5")).debtToEquity(new BigDecimal("1.1")).build(),
                Stock.builder().symbol("INFY").companyName("Infosys Limited").sector("Technology").price(new BigDecimal("1450.00")).changePercent(new BigDecimal("-1.10")).peRatio(new BigDecimal("22.4")).roe(new BigDecimal("31.5")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("SBIN").companyName("State Bank of India").sector("Finance").price(new BigDecimal("750.00")).changePercent(new BigDecimal("1.50")).peRatio(new BigDecimal("10.5")).roe(new BigDecimal("14.2")).debtToEquity(new BigDecimal("1.3")).build(),
                Stock.builder().symbol("BHARTIARTL").companyName("Bharti Airtel Ltd").sector("Telecommunication").price(new BigDecimal("1200.00")).changePercent(new BigDecimal("2.10")).peRatio(new BigDecimal("45.2")).roe(new BigDecimal("11.2")).debtToEquity(new BigDecimal("1.4")).build(),
                Stock.builder().symbol("ITC").companyName("ITC Limited").sector("Consumer Goods").price(new BigDecimal("420.00")).changePercent(new BigDecimal("0.30")).peRatio(new BigDecimal("25.1")).roe(new BigDecimal("29.4")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("LARSEN").companyName("Larsen & Toubro Ltd").sector("Construction").price(new BigDecimal("3500.00")).changePercent(new BigDecimal("1.80")).peRatio(new BigDecimal("38.9")).roe(new BigDecimal("15.1")).debtToEquity(new BigDecimal("0.6")).build(),
                Stock.builder().symbol("HINDUNILVR").companyName("Hindustan Unilever Ltd").sector("Consumer Goods").price(new BigDecimal("2300.00")).changePercent(new BigDecimal("-0.20")).peRatio(new BigDecimal("55.4")).roe(new BigDecimal("20.1")).debtToEquity(new BigDecimal("0.0")).build(),

                // --- ADDITIONAL NIFTY & SENSEX GIANTS ---
                Stock.builder().symbol("BAJFINANCE").companyName("Bajaj Finance Ltd").sector("Finance").price(new BigDecimal("6800.00")).changePercent(new BigDecimal("-1.50")).peRatio(new BigDecimal("35.2")).roe(new BigDecimal("23.4")).debtToEquity(new BigDecimal("3.2")).build(),
                Stock.builder().symbol("MARUTI").companyName("Maruti Suzuki India Ltd").sector("Automotive").price(new BigDecimal("12500.00")).changePercent(new BigDecimal("0.90")).peRatio(new BigDecimal("29.8")).roe(new BigDecimal("13.8")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("SUNPHARMA").companyName("Sun Pharmaceutical Industries").sector("Healthcare").price(new BigDecimal("1500.00")).changePercent(new BigDecimal("0.40")).peRatio(new BigDecimal("32.1")).roe(new BigDecimal("15.6")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("TATAMOTORS").companyName("Tata Motors Ltd").sector("Automotive").price(new BigDecimal("950.00")).changePercent(new BigDecimal("2.50")).peRatio(new BigDecimal("16.8")).roe(new BigDecimal("18.2")).debtToEquity(new BigDecimal("1.7")).build(),
                Stock.builder().symbol("ASIANPAINT").companyName("Asian Paints Ltd").sector("Consumer Goods").price(new BigDecimal("2800.00")).changePercent(new BigDecimal("-0.80")).peRatio(new BigDecimal("65.2")).roe(new BigDecimal("28.9")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("KOTAKBANK").companyName("Kotak Mahindra Bank Ltd").sector("Finance").price(new BigDecimal("1750.00")).changePercent(new BigDecimal("0.20")).peRatio(new BigDecimal("20.4")).roe(new BigDecimal("13.1")).debtToEquity(new BigDecimal("0.9")).build(),
                Stock.builder().symbol("AXISBANK").companyName("Axis Bank Ltd").sector("Finance").price(new BigDecimal("1150.00")).changePercent(new BigDecimal("1.10")).peRatio(new BigDecimal("14.1")).roe(new BigDecimal("16.5")).debtToEquity(new BigDecimal("1.2")).build(),
                Stock.builder().symbol("WIPRO").companyName("Wipro Limited").sector("Technology").price(new BigDecimal("520.00")).changePercent(new BigDecimal("-0.60")).peRatio(new BigDecimal("21.5")).roe(new BigDecimal("15.8")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("HCLTECH").companyName("HCL Technologies Ltd").sector("Technology").price(new BigDecimal("1580.00")).changePercent(new BigDecimal("1.40")).peRatio(new BigDecimal("27.2")).roe(new BigDecimal("24.1")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("TITAN").companyName("Titan Company Ltd").sector("Consumer Goods").price(new BigDecimal("3400.00")).changePercent(new BigDecimal("0.70")).peRatio(new BigDecimal("82.4")).roe(new BigDecimal("21.5")).debtToEquity(new BigDecimal("0.4")).build(),

                // --- METALS, ENERGY & INFRASTRUCTURE ---
                Stock.builder().symbol("ADANIENT").companyName("Adani Enterprises Ltd").sector("Metals & Mining").price(new BigDecimal("3100.00")).changePercent(new BigDecimal("3.20")).peRatio(new BigDecimal("95.1")).roe(new BigDecimal("9.2")).debtToEquity(new BigDecimal("2.1")).build(),
                Stock.builder().symbol("ADANIPORTS").companyName("Adani Ports & SEZ Ltd").sector("Infrastructure").price(new BigDecimal("1400.00")).changePercent(new BigDecimal("1.90")).peRatio(new BigDecimal("32.4")).roe(new BigDecimal("14.8")).debtToEquity(new BigDecimal("0.9")).build(),
                Stock.builder().symbol("POWERGRID").companyName("Power Grid Corporation of India").sector("Energy").price(new BigDecimal("310.00")).changePercent(new BigDecimal("0.40")).peRatio(new BigDecimal("18.2")).roe(new BigDecimal("18.4")).debtToEquity(new BigDecimal("1.6")).build(),
                Stock.builder().symbol("NTPC").companyName("NTPC Limited").sector("Energy").price(new BigDecimal("370.00")).changePercent(new BigDecimal("0.60")).peRatio(new BigDecimal("16.5")).roe(new BigDecimal("12.5")).debtToEquity(new BigDecimal("1.4")).build(),
                Stock.builder().symbol("TATASTEEL").companyName("Tata Steel Ltd").sector("Metals & Mining").price(new BigDecimal("165.00")).changePercent(new BigDecimal("-1.20")).peRatio(new BigDecimal("24.1")).roe(new BigDecimal("8.5")).debtToEquity(new BigDecimal("0.8")).build(),
                Stock.builder().symbol("JSWSTEEL").companyName("JSW Steel Ltd").sector("Metals & Mining").price(new BigDecimal("920.00")).changePercent(new BigDecimal("0.10")).peRatio(new BigDecimal("22.5")).roe(new BigDecimal("10.2")).debtToEquity(new BigDecimal("0.9")).build(),
                Stock.builder().symbol("ONGC").companyName("Oil & Natural Gas Corporation").sector("Energy").price(new BigDecimal("280.00")).changePercent(new BigDecimal("2.20")).peRatio(new BigDecimal("7.5")).roe(new BigDecimal("15.2")).debtToEquity(new BigDecimal("0.3")).build(),
                Stock.builder().symbol("COALINDIA").companyName("Coal India Ltd").sector("Energy").price(new BigDecimal("490.00")).changePercent(new BigDecimal("1.10")).peRatio(new BigDecimal("9.2")).roe(new BigDecimal("35.4")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("BPCL").companyName("Bharat Petroleum Corporation Ltd").sector("Energy").price(new BigDecimal("320.00")).changePercent(new BigDecimal("1.70")).peRatio(new BigDecimal("5.1")).roe(new BigDecimal("22.1")).debtToEquity(new BigDecimal("0.6")).build(),
                Stock.builder().symbol("HINDALCO").companyName("Hindalco Industries Ltd").sector("Metals & Mining").price(new BigDecimal("650.00")).changePercent(new BigDecimal("1.40")).peRatio(new BigDecimal("14.5")).roe(new BigDecimal("12.8")).debtToEquity(new BigDecimal("0.5")).build(),

                // --- PHARMA, AUTO & CONSUMER ---
                Stock.builder().symbol("CIPLA").companyName("Cipla Ltd").sector("Healthcare").price(new BigDecimal("1520.00")).changePercent(new BigDecimal("0.80")).peRatio(new BigDecimal("27.4")).roe(new BigDecimal("17.8")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("DRREDDY").companyName("Dr. Reddy's Laboratories Ltd").sector("Healthcare").price(new BigDecimal("6800.00")).changePercent(new BigDecimal("0.30")).peRatio(new BigDecimal("22.1")).roe(new BigDecimal("20.5")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("DIVISLAB").companyName("Divi's Laboratories Ltd").sector("Healthcare").price(new BigDecimal("4400.00")).changePercent(new BigDecimal("1.20")).peRatio(new BigDecimal("68.5")).roe(new BigDecimal("15.2")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("EICHERMOT").companyName("Eicher Motors Ltd").sector("Automotive").price(new BigDecimal("4800.00")).changePercent(new BigDecimal("1.50")).peRatio(new BigDecimal("39.2")).roe(new BigDecimal("19.5")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("HEROMOTOCO").companyName("Hero MotoCorp Ltd").sector("Automotive").price(new BigDecimal("5400.00")).changePercent(new BigDecimal("-0.50")).peRatio(new BigDecimal("26.4")).roe(new BigDecimal("18.2")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("BAJAJ-AUTO").companyName("Bajaj Auto Ltd").sector("Automotive").price(new BigDecimal("9800.00")).changePercent(new BigDecimal("2.00")).peRatio(new BigDecimal("35.4")).roe(new BigDecimal("29.5")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("BRITANNIA").companyName("Britannia Industries Ltd").sector("Consumer Goods").price(new BigDecimal("5100.00")).changePercent(new BigDecimal("0.40")).peRatio(new BigDecimal("48.2")).roe(new BigDecimal("45.5")).debtToEquity(new BigDecimal("0.7")).build(),
                Stock.builder().symbol("NESTLEIND").companyName("Nestle India Ltd").sector("Consumer Goods").price(new BigDecimal("2550.00")).changePercent(new BigDecimal("-0.10")).peRatio(new BigDecimal("78.1")).roe(new BigDecimal("105.2")).debtToEquity(new BigDecimal("0.2")).build(),
                Stock.builder().symbol("TATACONSUM").companyName("Tata Consumer Products Ltd").sector("Consumer Goods").price(new BigDecimal("1150.00")).changePercent(new BigDecimal("0.60")).peRatio(new BigDecimal("72.5")).roe(new BigDecimal("11.5")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("LTIM").companyName("LTIMindtree Ltd").sector("Technology").price(new BigDecimal("5900.00")).changePercent(new BigDecimal("-0.70")).peRatio(new BigDecimal("34.1")).roe(new BigDecimal("24.8")).debtToEquity(new BigDecimal("0.1")).build()
        ));
        System.out.println("FinSight Engine: Successfully Seeded Sensex & Nifty Blue-Chip Universe");
    }
}