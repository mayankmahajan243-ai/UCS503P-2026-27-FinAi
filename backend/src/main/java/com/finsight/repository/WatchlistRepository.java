package com.finsight.repository;

import com.finsight.model.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {

    List<WatchlistItem> findByUserId(String userId);

    List<WatchlistItem> findByUserIdAndWatchlistName(String userId, String watchlistName);

    Optional<WatchlistItem> findByUserIdAndSymbolAndWatchlistName(String userId, String symbol, String watchlistName);

    @Query("SELECT DISTINCT w.watchlistName FROM WatchlistItem w WHERE w.userId = :userId ORDER BY w.watchlistName ASC")
    List<String> findWatchlistNamesByUserId(@Param("userId") String userId);

    @Modifying
    @Transactional
    void deleteByUserIdAndWatchlistName(String userId, String watchlistName);

    @Modifying
    @Transactional
    void deleteByUserIdAndSymbolAndWatchlistName(String userId, String symbol, String watchlistName);
}
