package com.finsight.controller;

import com.finsight.repository.AlertRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:5173")
public class AlertController {
    private final AlertRepository repo;
    public AlertController(AlertRepository repo) { this.repo = repo; }

    @GetMapping("/{userId}")
    public Object get(@PathVariable String userId) { return repo.findByUserId(userId); }
}
