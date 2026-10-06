# ExpiryBox Deployment Guide

## 1. Prerequisites
- Java Development Kit (JDK 17 or 21)
- Apache Maven 3.8+
- MySQL Server 8.0+
- Apache Tomcat 10.1+ (Jakarta EE compliant)

## 2. Environment Variables
Configure the following in your environment or Tomcat `bin/setenv.sh`:
```bash
export DB_URL="jdbc:mysql://localhost:3306/expirybox?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
export DB_USERNAME="expirybox_user"
export DB_PASSWORD="secure_db_password"
export GEMINI_API_KEY="AIzaSy..."
export UPLOAD_DIR="/var/expirybox/uploads"
export APP_BASE_URL="https://yourdomain.com"
```

## 3. Database Initialization
```bash
mysql -u root -p -e "CREATE DATABASE expirybox CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p expirybox < database/schema.sql
mysql -u root -p expirybox < database/seed.sql
```

## 4. Build and Package WAR
```bash
mvn clean package -DskipTests
```
This produces `target/ExpiryBox.war`.

## 5. Tomcat Deployment
Copy the WAR file into the Tomcat webapps directory:
```bash
cp target/ExpiryBox.war $CATALINA_HOME/webapps/ROOT.war
$CATALINA_HOME/bin/startup.sh
```
Verify logs:
```bash
tail -f $CATALINA_HOME/logs/catalina.out
```
Visit: `http://localhost:8080/`
