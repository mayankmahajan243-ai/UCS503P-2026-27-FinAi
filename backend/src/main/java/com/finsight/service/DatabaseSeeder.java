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
                Holding.builder().userId("demo-user").symbol("RELIANCE").quantity(new BigDecimal("50")).averagePrice(new BigDecimal("2750.00")).build(),
                Holding.builder().userId("demo-user").symbol("TCS").quantity(new BigDecimal("25")).averagePrice(new BigDecimal("3800.00")).build(),
                Holding.builder().symbol("HDFCBANK").quantity(new BigDecimal("120")).averagePrice(new BigDecimal("1520.00")).build()
        ));
        System.out.println("FinSight Engine: Seeded Demo Portfolio");

        // 3. Seed Full NIFTY Universe safely
        stocks.deleteAll(); // Clear old records to prevent any constraint crashes
        stocks.saveAll(List.of(
                Stock.builder().symbol("RELIANCE").companyName("Reliance Industries").sector("Energy").price(new BigDecimal("2900.00")).changePercent(new BigDecimal("1.2")).peRatio(new BigDecimal("28.5")).roe(new BigDecimal("12.4")).debtToEquity(new BigDecimal("0.4")).build(),
                Stock.builder().symbol("TCS").companyName("Tata Consultancy Services").sector("Technology").price(new BigDecimal("3900.00")).changePercent(new BigDecimal("-0.5")).peRatio(new BigDecimal("30.1")).roe(new BigDecimal("45.2")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("HDFCBANK").companyName("HDFC Bank").sector("Finance").price(new BigDecimal("1600.00")).changePercent(new BigDecimal("0.8")).peRatio(new BigDecimal("18.5")).roe(new BigDecimal("16.8")).debtToEquity(new BigDecimal("1.2")).build(),
                Stock.builder().symbol("INFY").companyName("Infosys Limited").sector("Technology").price(new BigDecimal("1450.00")).changePercent(new BigDecimal("-1.1")).peRatio(new BigDecimal("22.4")).roe(new BigDecimal("31.5")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("ICICIBANK").companyName("ICICI Bank").sector("Finance").price(new BigDecimal("1100.00")).changePercent(new BigDecimal("0.5")).peRatio(new BigDecimal("17.2")).roe(new BigDecimal("17.5")).debtToEquity(new BigDecimal("1.1")).build(),
                Stock.builder().symbol("BHARTIARTL").companyName("Bharti Airtel").sector("Telecommunication").price(new BigDecimal("1200.00")).changePercent(new BigDecimal("2.1")).peRatio(new BigDecimal("45.2")).roe(new BigDecimal("11.2")).debtToEquity(new BigDecimal("1.4")).build(),
                Stock.builder().symbol("SBIN").companyName("State Bank of India").sector("Finance").price(new BigDecimal("750.00")).changePercent(new BigDecimal("1.5")).peRatio(new BigDecimal("10.5")).roe(new BigDecimal("14.2")).debtToEquity(new BigDecimal("1.3")).build(),
                Stock.builder().symbol("LARSEN").companyName("Larsen & Toubro").sector("Construction").price(new BigDecimal("3500.00")).changePercent(new BigDecimal("1.8")).peRatio(new BigDecimal("38.9")).roe(new BigDecimal("15.1")).debtToEquity(new BigDecimal("0.6")).build(),
                Stock.builder().symbol("ITC").companyName("ITC Limited").sector("Consumer Goods").price(new BigDecimal("420.00")).changePercent(new BigDecimal("0.3")).peRatio(new BigDecimal("25.1")).roe(new BigDecimal("29.4")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("HINDUNILVR").companyName("Hindustan Unilever").sector("Consumer Goods").price(new BigDecimal("2300.00")).changePercent(new BigDecimal("-0.2")).peRatio(new BigDecimal("55.4")).roe(new BigDecimal("20.1")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("BAJFINANCE").companyName("Bajaj Finance").sector("Finance").price(new BigDecimal("6800.00")).changePercent(new BigDecimal("-1.5")).peRatio(new BigDecimal("35.2")).roe(new BigDecimal("23.4")).debtToEquity(new BigDecimal("3.2")).build(),
                Stock.builder().symbol("MARUTI").companyName("Maruti Suzuki").sector("Automotive").price(new BigDecimal("12500.00")).changePercent(new BigDecimal("0.9")).peRatio(new BigDecimal("29.8")).roe(new BigDecimal("13.8")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("SUNPHARMA").companyName("Sun Pharmaceutical").sector("Healthcare").price(new BigDecimal("1500.00")).changePercent(new BigDecimal("0.4")).peRatio(new BigDecimal("32.1")).roe(new BigDecimal("15.6")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("TATAMOTORS").companyName("Tata Motors").sector("Automotive").price(new BigDecimal("950.00")).changePercent(new BigDecimal("2.5")).peRatio(new BigDecimal("16.8")).roe(new BigDecimal("18.2")).debtToEquity(new BigDecimal("1.7")).build(),
                Stock.builder().symbol("ASIANPAINT").companyName("Asian Paints").sector("Consumer Goods").price(new BigDecimal("2800.00")).changePercent(new BigDecimal("-0.8")).peRatio(new BigDecimal("65.2")).roe(new BigDecimal("28.9")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("KOTAKBANK").companyName("Kotak Mahindra Bank").sector("Finance").price(new BigDecimal("1750.00")).changePercent(new BigDecimal("0.2")).peRatio(new BigDecimal("20.4")).roe(new BigDecimal("13.1")).debtToEquity(new BigDecimal("0.9")).build(),
                Stock.builder().symbol("AXISBANK").companyName("Axis Bank").sector("Finance").price(new BigDecimal("1150.00")).changePercent(new BigDecimal("1.1")).peRatio(new BigDecimal("14.1")).roe(new BigDecimal("16.5")).debtToEquity(new BigDecimal("1.2")).build(),
                Stock.builder().symbol("WIPRO").companyName("Wipro Limited").sector("Technology").price(new BigDecimal("520.00")).changePercent(new BigDecimal("-0.6")).peRatio(new BigDecimal("21.5")).roe(new BigDecimal("15.8")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("HCLTECH").companyName("HCL Technologies").sector("Technology").price(new BigDecimal("1580.00")).changePercent(new BigDecimal("1.4")).peRatio(new BigDecimal("27.2")).roe(new BigDecimal("24.1")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("TITAN").companyName("Titan Company").sector("Consumer Goods").price(new BigDecimal("3400.00")).changePercent(new BigDecimal("0.7")).peRatio(new BigDecimal("82.4")).roe(new BigDecimal("21.5")).debtToEquity(new BigDecimal("0.4")).build(),
                Stock.builder().symbol("ADANIENT").companyName("Adani Enterprises").sector("Metals & Mining").price(new BigDecimal("3100.00")).changePercent(new BigDecimal("3.2")).peRatio(new BigDecimal("95.1")).roe(new BigDecimal("9.2")).debtToEquity(new BigDecimal("2.1")).build(),
                Stock.builder().symbol("ADANIPORTS").companyName("Adani Ports & SEZ").sector("Services").price(new BigDecimal("1400.00")).changePercent(new BigDecimal("1.9")).peRatio(new BigDecimal("32.4")).roe(new BigDecimal("14.8")).debtToEquity(new BigDecimal("0.9")).build(),
                Stock.builder().symbol("POWERGRID").companyName("Power Grid Corporation").sector("Energy").price(new BigDecimal("310.00")).changePercent(new BigDecimal("0.4")).peRatio(new BigDecimal("18.2")).roe(new BigDecimal("18.4")).debtToEquity(new BigDecimal("1.6")).build(),
                Stock.builder().symbol("NTPC").companyName("NTPC Limited").sector("Energy").price(new BigDecimal("370.00")).changePercent(new BigDecimal("0.6")).peRatio(new BigDecimal("16.5")).roe(new BigDecimal("12.5")).debtToEquity(new BigDecimal("1.4")).build(),
                Stock.builder().symbol("TATASTEEL").companyName("Tata Steel").sector("Metals & Mining").price(new BigDecimal("165.00")).changePercent(new BigDecimal("-1.2")).peRatio(new BigDecimal("24.1")).roe(new BigDecimal("8.5")).debtToEquity(new BigDecimal("0.8")).build(),
                Stock.builder().symbol("JSWSTEEL").companyName("JSW Steel").sector("Metals & Mining").price(new BigDecimal("920.00")).changePercent(new BigDecimal("0.1")).peRatio(new BigDecimal("22.5")).roe(new BigDecimal("10.2")).debtToEquity(new BigDecimal("0.9")).build(),
                Stock.builder().symbol("GRASIM").companyName("Grasim Industries").sector("Construction").price(new BigDecimal("2450.00")).changePercent(new BigDecimal("1.0")).peRatio(new BigDecimal("36.4")).roe(new BigDecimal("9.8")).debtToEquity(new BigDecimal("0.5")).build(),
                Stock.builder().symbol("TECHM").companyName("Tech Mahindra").sector("Technology").price(new BigDecimal("1320.00")).changePercent(new BigDecimal("-0.3")).peRatio(new BigDecimal("28.9")).roe(new BigDecimal("14.5")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("ONGC").companyName("Oil & Natural Gas Corp").sector("Energy").price(new BigDecimal("280.00")).changePercent(new BigDecimal("2.2")).peRatio(new BigDecimal("7.5")).roe(new BigDecimal("15.2")).debtToEquity(new BigDecimal("0.3")).build(),
                Stock.builder().symbol("COALINDIA").companyName("Coal India").sector("Energy").price(new BigDecimal("490.00")).changePercent(new BigDecimal("1.1")).peRatio(new BigDecimal("9.2")).roe(new BigDecimal("35.4")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("BAJAJFINSV").companyName("Bajaj Finserv").sector("Finance").price(new BigDecimal("1650.00")).changePercent(new BigDecimal("-0.4")).peRatio(new BigDecimal("32.1")).roe(new BigDecimal("14.1")).debtToEquity(new BigDecimal("1.8")).build(),
                Stock.builder().symbol("SBILIFE").companyName("SBI Life Insurance").sector("Finance").price(new BigDecimal("1480.00")).changePercent(new BigDecimal("0.5")).peRatio(new BigDecimal("75.2")).roe(new BigDecimal("13.9")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("HDFCLIFE").companyName("HDFC Life Insurance").sector("Finance").price(new BigDecimal("650.00")).changePercent(new BigDecimal("0.2")).peRatio(new BigDecimal("88.4")).roe(new BigDecimal("12.4")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("BPCL").companyName("Bharat Petroleum Corp").sector("Energy").price(new BigDecimal("320.00")).changePercent(new BigDecimal("1.7")).peRatio(new BigDecimal("5.1")).roe(new BigDecimal("22.1")).debtToEquity(new BigDecimal("0.6")).build(),
                Stock.builder().symbol("INDUSINDBK").companyName("IndusInd Bank").sector("Finance").price(new BigDecimal("1420.00")).changePercent(new BigDecimal("-1.8")).peRatio(new BigDecimal("13.2")).roe(new BigDecimal("15.1")).debtToEquity(new BigDecimal("1.4")).build(),
                Stock.builder().symbol("CIPLA").companyName("Cipla Limited").sector("Healthcare").price(new BigDecimal("1520.00")).changePercent(new BigDecimal("0.8")).peRatio(new BigDecimal("27.4")).roe(new BigDecimal("17.8")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("DRREDDY").companyName("Dr. Reddy's Laboratories").sector("Healthcare").price(new BigDecimal("6800.00")).changePercent(new BigDecimal("0.3")).peRatio(new BigDecimal("22.1")).roe(new BigDecimal("20.5")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("DIVISLAB").companyName("Divi's Laboratories").sector("Healthcare").price(new BigDecimal("4400.00")).changePercent(new BigDecimal("1.2")).peRatio(new BigDecimal("68.5")).roe(new BigDecimal("15.2")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("EICHERMOT").companyName("Eicher Motors").sector("Automotive").price(new BigDecimal("4800.00")).changePercent(new BigDecimal("1.5")).peRatio(new BigDecimal("39.2")).roe(new BigDecimal("19.5")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("HEROMOTOCO").companyName("Hero MotoCorp").sector("Automotive").price(new BigDecimal("5400.00")).changePercent(new BigDecimal("-0.5")).peRatio(new BigDecimal("26.4")).roe(new BigDecimal("18.2")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("BRITANNIA").companyName("Britannia Industries").sector("Consumer Goods").price(new BigDecimal("5100.00")).changePercent(new BigDecimal("0.4")).peRatio(new BigDecimal("48.2")).roe(new BigDecimal("45.5")).debtToEquity(new BigDecimal("0.7")).build(),
                Stock.builder().symbol("NESTLEIND").companyName("Nestle India").sector("Consumer Goods").price(new BigDecimal("2550.00")).changePercent(new BigDecimal("-0.1")).peRatio(new BigDecimal("78.1")).roe(new BigDecimal("105.2")).debtToEquity(new BigDecimal("0.2")).build(),
                Stock.builder().symbol("APOLLOHOSP").companyName("Apollo Hospitals").sector("Healthcare").price(new BigDecimal("6600.00")).changePercent(new BigDecimal("2.1")).peRatio(new BigDecimal("92.4")).roe(new BigDecimal("12.1")).debtToEquity(new BigDecimal("0.4")).build(),
                Stock.builder().symbol("TATACONSUM").companyName("Tata Consumer Products").sector("Consumer Goods").price(new BigDecimal("1150.00")).changePercent(new BigDecimal("0.6")).peRatio(new BigDecimal("72.5")).roe(new BigDecimal("11.5")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("UPL").companyName("UPL Limited").sector("Chemicals").price(new BigDecimal("530.00")).changePercent(new BigDecimal("-1.5")).peRatio(new BigDecimal("25.4")).roe(new BigDecimal("8.2")).debtToEquity(new BigDecimal("0.9")).build(),
                Stock.builder().symbol("SHREECEM").companyName("Shree Cement").sector("Construction").price(new BigDecimal("26500.00")).changePercent(new BigDecimal("0.8")).peRatio(new BigDecimal("45.2")).roe(new BigDecimal("11.4")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("HINDALCO").companyName("Hindalco Industries").sector("Metals & Mining").price(new BigDecimal("650.00")).changePercent(new BigDecimal("1.4")).peRatio(new BigDecimal("14.5")).roe(new BigDecimal("12.8")).debtToEquity(new BigDecimal("0.5")).build(),
                Stock.builder().symbol("BAJAJ-AUTO").companyName("Bajaj Auto").sector("Automotive").price(new BigDecimal("9800.00")).changePercent(new BigDecimal("2.0")).peRatio(new BigDecimal("35.4")).roe(new BigDecimal("29.5")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("LTIM").companyName("LTIMindtree").sector("Technology").price(new BigDecimal("5900.00")).changePercent(new BigDecimal("-0.7")).peRatio(new BigDecimal("34.1")).roe(new BigDecimal("24.8")).debtToEquity(new BigDecimal("0.1")).build()
        ));
        System.out.println("FinSight Engine: Successfully Seeded Clean NIFTY Universe");
    }
}