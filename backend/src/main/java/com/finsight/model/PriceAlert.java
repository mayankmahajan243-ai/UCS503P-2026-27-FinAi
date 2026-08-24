package com.finsight.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "price_alerts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PriceAlert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id") private String userId;
    private String symbol;
    @Column(name = "target_price") private BigDecimal targetPrice;
    private String direction;
    private boolean active;
}
