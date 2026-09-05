package com.finsight.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "watchlists",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "symbol", "watchlist_name"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WatchlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String symbol;

    @Builder.Default
    @Column(name = "watchlist_name", nullable = false)
    private String watchlistName = "Default";
}
