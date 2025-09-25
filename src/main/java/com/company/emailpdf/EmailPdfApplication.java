package com.company.emailpdf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.company.emailpdf.config.ApplicationConfiguration;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(ApplicationConfiguration.class)
public class EmailPdfApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(EmailPdfApplication.class, args);
    }
}