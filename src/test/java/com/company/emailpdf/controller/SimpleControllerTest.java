package com.company.emailpdf.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(SimpleController.class)
@ActiveProfiles("test")
class SimpleControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void getStatus_ReturnsStatusInformation() throws Exception {
        mockMvc.perform(get("/api/status"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.service").value("Email to PDF Converter"))
            .andExpect(jsonPath("$.status").value("running"))
            .andExpect(jsonPath("$.version").value("1.0.0"))
            .andExpect(jsonPath("$.timestamp").exists());
    }
    
    @Test
    void health_ReturnsHealthStatus() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.service").value("Java Spring Boot Email to PDF Converter"));
    }
    
    @Test
    void convertEmails_WithValidRequest_ReturnsResponse() throws Exception {
        String requestBody = "{\"mailboxId\":\"test@company.com\",\"maxEmails\":50}";
        
        mockMvc.perform(post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.message").value("Email conversion service is ready"))
            .andExpect(jsonPath("$.status").value("pending"))
            .andExpect(jsonPath("$.requested").exists());
    }
    
    @Test
    void convertEmails_WithEmptyRequest_ReturnsResponse() throws Exception {
        String requestBody = "{}";
        
        mockMvc.perform(post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").exists());
    }
    
    @Test
    void getStatus_MultipleRequests_ReturnsConsistentData() throws Exception {
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(get("/api/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("Email to PDF Converter"))
                .andExpect(jsonPath("$.version").value("1.0.0"));
        }
    }
    
    @Test
    void health_AlwaysReturnsUp() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
    }
    
    @Test
    void apiEndpoints_AcceptCorrectContentType() throws Exception {
        mockMvc.perform(post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk());
    }
}
