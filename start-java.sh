#!/bin/bash
echo "Starting Java Spring Boot Email to PDF Converter..."

# Set Java and Spring Boot properties
export JAVA_OPTS="-Xmx512m -Xms256m"
export SERVER_PORT=8080
export SPRING_PROFILES_ACTIVE=dev

# Stop any existing Java processes
pkill -f "spring-boot:run" 2>/dev/null || true
pkill -f "EmailPdfApplication" 2>/dev/null || true

# Start the application
echo "Compiling and starting Spring Boot application on port 8080..."
mvn clean spring-boot:run -Dspring-boot.run.profiles=dev -Dspring.main.banner-mode=console -Dserver.port=8080 -DskipTests=true