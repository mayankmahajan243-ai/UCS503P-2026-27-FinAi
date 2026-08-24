package com.finsight.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stocks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Stock {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false) private String symbol;
    @Column(name = "company_name", nullable = false) private String companyName;
    private String sector;
    private BigDecimal price;
    @Column(name = "change_percent") private BigDecimal changePercent;
    @Column(name = "pe_ratio") private BigDecimal peRatio;
    private BigDecimal roe;
    @Column(name = "debt_to_equity") private BigDecimal debtToEquity;
    @Column(name = "market_cap") private BigDecimal marketCap;
    @Column(name = "updated_at") private LocalDateTime updatedAt;
}
