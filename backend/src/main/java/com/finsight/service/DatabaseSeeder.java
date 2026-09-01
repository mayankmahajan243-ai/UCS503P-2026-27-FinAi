package com.finsight.service;

import com.finsight.model.Holding;
import com.finsight.model.Stock;
import com.finsight.model.User;
import com.finsight.model.Wallet;
import com.finsight.repository.HoldingRepository;
import com.finsight.repository.StockRepository;
import com.finsight.repository.UserRepository;
import com.finsight.repository.WalletRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final StockRepository stocks;
    private final HoldingRepository holdings;
    private final WalletRepository wallets;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(StockRepository stocks, HoldingRepository holdings,
                          WalletRepository wallets, UserRepository users, PasswordEncoder passwordEncoder) {
        this.stocks   = stocks;
        this.holdings = holdings;
        this.wallets  = wallets;
        this.users    = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        Optional<User> demoUserOpt = users.findByUsername("demo-user");
        if (demoUserOpt.isEmpty()) {
            users.save(User.builder()
                    .username("demo-user")
                    .password(passwordEncoder.encode("finsight2026"))
                    .displayName("Mayank Mahajan")
                    .email("mayankmahajan243@gmail.com")
                    .role("INVESTOR")
                    .build());
            System.out.println("FinSight Engine: Demo user seeded → demo-user / finsight2026");
        } else {
            User demoUser = demoUserOpt.get();
            String pwd = demoUser.getPassword();
            if (pwd != null && !pwd.startsWith("$2a$") && !pwd.startsWith("$2b$") && !pwd.startsWith("$2y$")) {
                demoUser.setPassword(passwordEncoder.encode(pwd));
                users.save(demoUser);
                System.out.println("FinSight Engine: Upgraded demo-user password to BCrypt hash");
            }
        }

        // ─────────────────────────────────────────────
        // 2. Seed Virtual Wallet (₹10L)
        // ─────────────────────────────────────────────
        if (wallets.count() == 0) {
            wallets.save(Wallet.builder()
                    .userId("demo-user")
                    .balance(new BigDecimal("1000000.00"))
                    .build());
            System.out.println("FinSight Engine: Seeded Virtual Wallet with ₹10,00,000");
        }

        // ─────────────────────────────────────────────
        // 3. Seed Demo Portfolio (with userId fix)
        // ─────────────────────────────────────────────
        if (holdings.count() == 0) {
            holdings.saveAll(List.of(
                    Holding.builder().userId("demo-user").symbol("RELIANCE").quantity(new BigDecimal("100")).averagePrice(new BigDecimal("1285.00")).build(),
                    Holding.builder().userId("demo-user").symbol("TCS").quantity(new BigDecimal("50")).averagePrice(new BigDecimal("2340.00")).build(),
                    Holding.builder().userId("demo-user").symbol("HDFCBANK").quantity(new BigDecimal("150")).averagePrice(new BigDecimal("1600.00")).build()
            ));
            System.out.println("FinSight Engine: Seeded Demo Portfolio (3 holdings)");
        }

        // ─────────────────────────────────────────────
        // 4. Seed Full Nifty 50 Universe
        // ─────────────────────────────────────────────
        if (stocks.count() == 0) {
            stocks.saveAll(List.of(

                // ── TECHNOLOGY ──────────────────────────────────────────────────────
                Stock.builder().symbol("TCS").companyName("Tata Consultancy Services Ltd").sector("Technology").price(new BigDecimal("3542.00")).changePercent(new BigDecimal("0.42")).peRatio(new BigDecimal("26.1")).roe(new BigDecimal("47.3")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("INFY").companyName("Infosys Limited").sector("Technology").price(new BigDecimal("1847.50")).changePercent(new BigDecimal("-0.38")).peRatio(new BigDecimal("24.2")).roe(new BigDecimal("32.8")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("WIPRO").companyName("Wipro Limited").sector("Technology").price(new BigDecimal("528.40")).changePercent(new BigDecimal("-0.22")).peRatio(new BigDecimal("20.8")).roe(new BigDecimal("14.9")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("HCLTECH").companyName("HCL Technologies Ltd").sector("Technology").price(new BigDecimal("1612.30")).changePercent(new BigDecimal("0.85")).peRatio(new BigDecimal("27.5")).roe(new BigDecimal("23.1")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("TECHM").companyName("Tech Mahindra Ltd").sector("Technology").price(new BigDecimal("1542.70")).changePercent(new BigDecimal("1.14")).peRatio(new BigDecimal("32.4")).roe(new BigDecimal("14.2")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("LTIM").companyName("LTIMindtree Ltd").sector("Technology").price(new BigDecimal("5874.00")).changePercent(new BigDecimal("-0.55")).peRatio(new BigDecimal("34.8")).roe(new BigDecimal("25.1")).debtToEquity(new BigDecimal("0.0")).build(),

                // ── FINANCE / BANKING ────────────────────────────────────────────────
                Stock.builder().symbol("HDFCBANK").companyName("HDFC Bank Ltd").sector("Finance").price(new BigDecimal("1724.80")).changePercent(new BigDecimal("0.62")).peRatio(new BigDecimal("19.2")).roe(new BigDecimal("17.1")).debtToEquity(new BigDecimal("1.2")).build(),
                Stock.builder().symbol("ICICIBANK").companyName("ICICI Bank Ltd").sector("Finance").price(new BigDecimal("1248.60")).changePercent(new BigDecimal("0.78")).peRatio(new BigDecimal("18.5")).roe(new BigDecimal("18.2")).debtToEquity(new BigDecimal("1.1")).build(),
                Stock.builder().symbol("KOTAKBANK").companyName("Kotak Mahindra Bank Ltd").sector("Finance").price(new BigDecimal("1892.40")).changePercent(new BigDecimal("0.35")).peRatio(new BigDecimal("22.1")).roe(new BigDecimal("13.8")).debtToEquity(new BigDecimal("0.9")).build(),
                Stock.builder().symbol("AXISBANK").companyName("Axis Bank Ltd").sector("Finance").price(new BigDecimal("1178.20")).changePercent(new BigDecimal("0.91")).peRatio(new BigDecimal("14.8")).roe(new BigDecimal("17.2")).debtToEquity(new BigDecimal("1.2")).build(),
                Stock.builder().symbol("SBIN").companyName("State Bank of India").sector("Finance").price(new BigDecimal("824.60")).changePercent(new BigDecimal("1.22")).peRatio(new BigDecimal("11.2")).roe(new BigDecimal("15.4")).debtToEquity(new BigDecimal("1.3")).build(),
                Stock.builder().symbol("INDUSINDBK").companyName("IndusInd Bank Ltd").sector("Finance").price(new BigDecimal("1124.50")).changePercent(new BigDecimal("-0.48")).peRatio(new BigDecimal("11.8")).roe(new BigDecimal("14.2")).debtToEquity(new BigDecimal("1.1")).build(),
                Stock.builder().symbol("BAJFINANCE").companyName("Bajaj Finance Ltd").sector("Finance").price(new BigDecimal("7245.00")).changePercent(new BigDecimal("-0.82")).peRatio(new BigDecimal("36.4")).roe(new BigDecimal("24.1")).debtToEquity(new BigDecimal("3.2")).build(),
                Stock.builder().symbol("BAJAJFINSV").companyName("Bajaj Finserv Ltd").sector("Finance").price(new BigDecimal("1842.30")).changePercent(new BigDecimal("0.44")).peRatio(new BigDecimal("28.2")).roe(new BigDecimal("13.8")).debtToEquity(new BigDecimal("1.4")).build(),
                Stock.builder().symbol("SBILIFE").companyName("SBI Life Insurance Company Ltd").sector("Finance").price(new BigDecimal("1724.80")).changePercent(new BigDecimal("0.28")).peRatio(new BigDecimal("71.2")).roe(new BigDecimal("14.8")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("HDFCLIFE").companyName("HDFC Life Insurance Company Ltd").sector("Finance").price(new BigDecimal("742.40")).changePercent(new BigDecimal("0.14")).peRatio(new BigDecimal("84.2")).roe(new BigDecimal("12.4")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("SHRIRAMFIN").companyName("Shriram Finance Ltd").sector("Finance").price(new BigDecimal("3412.00")).changePercent(new BigDecimal("1.08")).peRatio(new BigDecimal("15.2")).roe(new BigDecimal("18.4")).debtToEquity(new BigDecimal("2.8")).build(),

                // ── ENERGY / OIL & GAS ───────────────────────────────────────────────
                Stock.builder().symbol("RELIANCE").companyName("Reliance Industries Ltd").sector("Energy").price(new BigDecimal("1312.40")).changePercent(new BigDecimal("0.54")).peRatio(new BigDecimal("24.8")).roe(new BigDecimal("13.2")).debtToEquity(new BigDecimal("0.4")).build(),
                Stock.builder().symbol("ONGC").companyName("Oil & Natural Gas Corporation").sector("Energy").price(new BigDecimal("294.70")).changePercent(new BigDecimal("1.42")).peRatio(new BigDecimal("7.8")).roe(new BigDecimal("15.8")).debtToEquity(new BigDecimal("0.3")).build(),
                Stock.builder().symbol("POWERGRID").companyName("Power Grid Corporation of India").sector("Energy").price(new BigDecimal("328.40")).changePercent(new BigDecimal("0.48")).peRatio(new BigDecimal("19.2")).roe(new BigDecimal("19.2")).debtToEquity(new BigDecimal("1.6")).build(),
                Stock.builder().symbol("NTPC").companyName("NTPC Limited").sector("Energy").price(new BigDecimal("384.60")).changePercent(new BigDecimal("0.72")).peRatio(new BigDecimal("17.8")).roe(new BigDecimal("13.1")).debtToEquity(new BigDecimal("1.4")).build(),
                Stock.builder().symbol("COALINDIA").companyName("Coal India Ltd").sector("Energy").price(new BigDecimal("512.80")).changePercent(new BigDecimal("0.94")).peRatio(new BigDecimal("9.8")).roe(new BigDecimal("36.2")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("BPCL").companyName("Bharat Petroleum Corporation Ltd").sector("Energy").price(new BigDecimal("348.20")).changePercent(new BigDecimal("1.24")).peRatio(new BigDecimal("5.4")).roe(new BigDecimal("23.4")).debtToEquity(new BigDecimal("0.6")).build(),

                // ── CONSUMER GOODS ───────────────────────────────────────────────────
                Stock.builder().symbol("HINDUNILVR").companyName("Hindustan Unilever Ltd").sector("Consumer Goods").price(new BigDecimal("2418.60")).changePercent(new BigDecimal("-0.18")).peRatio(new BigDecimal("56.8")).roe(new BigDecimal("21.4")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("ITC").companyName("ITC Limited").sector("Consumer Goods").price(new BigDecimal("448.20")).changePercent(new BigDecimal("0.42")).peRatio(new BigDecimal("26.4")).roe(new BigDecimal("30.2")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("NESTLEIND").companyName("Nestle India Ltd").sector("Consumer Goods").price(new BigDecimal("2412.80")).changePercent(new BigDecimal("-0.08")).peRatio(new BigDecimal("79.4")).roe(new BigDecimal("108.2")).debtToEquity(new BigDecimal("0.2")).build(),
                Stock.builder().symbol("BRITANNIA").companyName("Britannia Industries Ltd").sector("Consumer Goods").price(new BigDecimal("5248.40")).changePercent(new BigDecimal("0.38")).peRatio(new BigDecimal("49.8")).roe(new BigDecimal("46.8")).debtToEquity(new BigDecimal("0.7")).build(),
                Stock.builder().symbol("TATACONSUM").companyName("Tata Consumer Products Ltd").sector("Consumer Goods").price(new BigDecimal("1184.60")).changePercent(new BigDecimal("0.52")).peRatio(new BigDecimal("74.2")).roe(new BigDecimal("12.1")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("ASIANPAINT").companyName("Asian Paints Ltd").sector("Consumer Goods").price(new BigDecimal("2624.80")).changePercent(new BigDecimal("-0.62")).peRatio(new BigDecimal("62.4")).roe(new BigDecimal("29.8")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("TITAN").companyName("Titan Company Ltd").sector("Consumer Goods").price(new BigDecimal("3548.60")).changePercent(new BigDecimal("0.62")).peRatio(new BigDecimal("84.2")).roe(new BigDecimal("22.1")).debtToEquity(new BigDecimal("0.4")).build(),

                // ── AUTOMOTIVE ───────────────────────────────────────────────────────
                Stock.builder().symbol("MARUTI").companyName("Maruti Suzuki India Ltd").sector("Automotive").price(new BigDecimal("12842.00")).changePercent(new BigDecimal("0.84")).peRatio(new BigDecimal("31.4")).roe(new BigDecimal("14.8")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("TATAMOTORS").companyName("Tata Motors Ltd").sector("Automotive").price(new BigDecimal("982.40")).changePercent(new BigDecimal("1.82")).peRatio(new BigDecimal("18.4")).roe(new BigDecimal("19.2")).debtToEquity(new BigDecimal("1.7")).build(),
                Stock.builder().symbol("MM").companyName("Mahindra & Mahindra Ltd").sector("Automotive").price(new BigDecimal("3124.80")).changePercent(new BigDecimal("1.28")).peRatio(new BigDecimal("28.4")).roe(new BigDecimal("18.4")).debtToEquity(new BigDecimal("0.3")).build(),
                Stock.builder().symbol("BAJAJ-AUTO").companyName("Bajaj Auto Ltd").sector("Automotive").price(new BigDecimal("9948.60")).changePercent(new BigDecimal("1.42")).peRatio(new BigDecimal("36.8")).roe(new BigDecimal("30.8")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("EICHERMOT").companyName("Eicher Motors Ltd").sector("Automotive").price(new BigDecimal("4924.80")).changePercent(new BigDecimal("1.14")).peRatio(new BigDecimal("40.2")).roe(new BigDecimal("20.8")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("HEROMOTOCO").companyName("Hero MotoCorp Ltd").sector("Automotive").price(new BigDecimal("5512.40")).changePercent(new BigDecimal("-0.42")).peRatio(new BigDecimal("27.8")).roe(new BigDecimal("19.4")).debtToEquity(new BigDecimal("0.0")).build(),

                // ── HEALTHCARE / PHARMA ──────────────────────────────────────────────
                Stock.builder().symbol("SUNPHARMA").companyName("Sun Pharmaceutical Industries").sector("Healthcare").price(new BigDecimal("1624.80")).changePercent(new BigDecimal("0.52")).peRatio(new BigDecimal("33.8")).roe(new BigDecimal("16.8")).debtToEquity(new BigDecimal("0.1")).build(),
                Stock.builder().symbol("CIPLA").companyName("Cipla Ltd").sector("Healthcare").price(new BigDecimal("1548.80")).changePercent(new BigDecimal("0.68")).peRatio(new BigDecimal("28.2")).roe(new BigDecimal("18.4")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("DRREDDY").companyName("Dr. Reddy's Laboratories Ltd").sector("Healthcare").price(new BigDecimal("6948.60")).changePercent(new BigDecimal("0.24")).peRatio(new BigDecimal("22.8")).roe(new BigDecimal("21.2")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("DIVISLAB").companyName("Divi's Laboratories Ltd").sector("Healthcare").price(new BigDecimal("4524.80")).changePercent(new BigDecimal("0.94")).peRatio(new BigDecimal("69.8")).roe(new BigDecimal("15.8")).debtToEquity(new BigDecimal("0.0")).build(),
                Stock.builder().symbol("APOLLOHOSP").companyName("Apollo Hospitals Enterprise Ltd").sector("Healthcare").price(new BigDecimal("6824.40")).changePercent(new BigDecimal("1.24")).peRatio(new BigDecimal("87.4")).roe(new BigDecimal("14.8")).debtToEquity(new BigDecimal("0.4")).build(),

                // ── METALS & MINING ──────────────────────────────────────────────────
                Stock.builder().symbol("TATASTEEL").companyName("Tata Steel Ltd").sector("Metals & Mining").price(new BigDecimal("172.80")).changePercent(new BigDecimal("-0.82")).peRatio(new BigDecimal("25.4")).roe(new BigDecimal("9.2")).debtToEquity(new BigDecimal("0.8")).build(),
                Stock.builder().symbol("JSWSTEEL").companyName("JSW Steel Ltd").sector("Metals & Mining").price(new BigDecimal("948.60")).changePercent(new BigDecimal("0.24")).peRatio(new BigDecimal("23.8")).roe(new BigDecimal("11.4")).debtToEquity(new BigDecimal("0.9")).build(),
                Stock.builder().symbol("HINDALCO").companyName("Hindalco Industries Ltd").sector("Metals & Mining").price(new BigDecimal("672.40")).changePercent(new BigDecimal("1.08")).peRatio(new BigDecimal("15.2")).roe(new BigDecimal("13.4")).debtToEquity(new BigDecimal("0.5")).build(),

                // ── INFRASTRUCTURE / CONGLOMERATE ────────────────────────────────────
                Stock.builder().symbol("LARSEN").companyName("Larsen & Toubro Ltd").sector("Infrastructure").price(new BigDecimal("3712.80")).changePercent(new BigDecimal("1.42")).peRatio(new BigDecimal("40.2")).roe(new BigDecimal("15.8")).debtToEquity(new BigDecimal("0.6")).build(),
                Stock.builder().symbol("ADANIENT").companyName("Adani Enterprises Ltd").sector("Infrastructure").price(new BigDecimal("3248.60")).changePercent(new BigDecimal("2.14")).peRatio(new BigDecimal("98.4")).roe(new BigDecimal("9.8")).debtToEquity(new BigDecimal("2.1")).build(),
                Stock.builder().symbol("ADANIPORTS").companyName("Adani Ports & SEZ Ltd").sector("Infrastructure").price(new BigDecimal("1448.80")).changePercent(new BigDecimal("1.62")).peRatio(new BigDecimal("33.8")).roe(new BigDecimal("15.4")).debtToEquity(new BigDecimal("0.9")).build(),
                Stock.builder().symbol("BHARTIARTL").companyName("Bharti Airtel Ltd").sector("Telecom").price(new BigDecimal("1624.80")).changePercent(new BigDecimal("1.84")).peRatio(new BigDecimal("47.8")).roe(new BigDecimal("12.4")).debtToEquity(new BigDecimal("1.4")).build(),
                Stock.builder().symbol("ULTRACEMCO").companyName("UltraTech Cement Ltd").sector("Infrastructure").price(new BigDecimal("11842.60")).changePercent(new BigDecimal("0.62")).peRatio(new BigDecimal("38.4")).roe(new BigDecimal("16.4")).debtToEquity(new BigDecimal("0.3")).build(),
                Stock.builder().symbol("GRASIM").companyName("Grasim Industries Ltd").sector("Infrastructure").price(new BigDecimal("2748.40")).changePercent(new BigDecimal("0.48")).peRatio(new BigDecimal("22.8")).roe(new BigDecimal("12.8")).debtToEquity(new BigDecimal("0.4")).build()
        ));
            System.out.println("FinSight Engine: ✅ Full Nifty 50 Universe seeded — 50 stocks ready!");
        }
    }
}