package com.finsight.controller;

import com.finsight.service.AIInsightsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIInsightController {

    private final AIInsightsService aiInsightsService;

    public AIInsightController(AIInsightsService aiInsightsService) {
        this.aiInsightsService = aiInsightsService;
    }

    @GetMapping("/insights")
    public Map<String, Object> getInsights() {
        return aiInsightsService.getInsights("demo-user");
    }

    @GetMapping("/insights/{userId}")
    public Map<String, Object> getInsightsForUser(
            @PathVariable String userId) {

        return aiInsightsService.getInsights(userId);
    }
}