package com.finsight.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "holdings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Holding {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id") private String userId;
    private String symbol;
    private BigDecimal quantity;
    @Column(name = "average_price") private BigDecimal averagePrice;
}
