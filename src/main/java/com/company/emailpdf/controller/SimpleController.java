package com.company.emailpdf.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SimpleController {
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service", "Email to PDF Converter");
        status.put("status", "running");
        status.put("timestamp", LocalDateTime.now());
        status.put("version", "1.0.0");
        return ResponseEntity.ok(status);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Java Spring Boot Email to PDF Converter");
        return ResponseEntity.ok(health);
    }
    
    @PostMapping("/convert")
    public ResponseEntity<Map<String, Object>> convertEmails(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Email conversion service is ready");
        response.put("requested", LocalDateTime.now());
        response.put("status", "pending");
        return ResponseEntity.ok(response);
    }
}