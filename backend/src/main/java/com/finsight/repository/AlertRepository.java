package com.finsight.repository;

import com.finsight.model.PriceAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<PriceAlert, Long> {
    List<PriceAlert> findByUserId(String userId);
}
