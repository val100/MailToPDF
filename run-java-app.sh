#!/bin/bash

echo "🚀 Starting Java Spring Boot Email to PDF Converter on port 8080..."

# Set environment variables for clean startup
export SERVER_PORT=8080
export SPRING_PROFILES_ACTIVE=dev
export SPRING_DATASOURCE_URL=jdbc:h2:mem:emailpdf
export SPRING_DATASOURCE_USERNAME=sa
export SPRING_DATASOURCE_PASSWORD=
export SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver

# Navigate to project directory
cd /home/runner/workspace

echo "📋 Configuration:"
echo "  - Port: 8080"
echo "  - Database: H2 in-memory"
echo "  - Profile: dev"
echo "  - H2 Console: http://localhost:8080/h2-console"
echo ""

# Start the application
echo "🔧 Compiling and starting Java Spring Boot application..."
exec mvn spring-boot:run \
  -Dspring-boot.run.profiles=dev \
  -Dserver.port=8080 \
  -Dspring.datasource.url=jdbc:h2:mem:emailpdf \
  -Dspring.datasource.username=sa \
  -Dspring.datasource.password= \
  -Dspring.datasource.driver-class-name=org.h2.Driver \
  -DskipTests=true