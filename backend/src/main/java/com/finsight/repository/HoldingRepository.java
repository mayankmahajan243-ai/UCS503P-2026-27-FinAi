package com.finsight.repository;

import com.finsight.model.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HoldingRepository extends JpaRepository<Holding, Long> {
    List<Holding> findByUserId(String userId);
}
