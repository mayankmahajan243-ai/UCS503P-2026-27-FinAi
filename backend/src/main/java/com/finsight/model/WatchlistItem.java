package com.finsight.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "watchlists")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WatchlistItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id") private String userId;
    private String symbol;
}
