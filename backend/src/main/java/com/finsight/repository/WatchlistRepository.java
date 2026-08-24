package com.finsight.repository;

import com.finsight.model.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {
    List<WatchlistItem> findByUserId(String userId);
}
