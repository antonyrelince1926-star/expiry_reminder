package com.expirybox.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * High-performance JDBC Connection Pool using HikariCP.
 * Supports externalized configuration via environment variables:
 * DB_URL, DB_USERNAME, DB_PASSWORD
 */
public class DatabaseConnection {
    private static final Logger LOGGER = Logger.getLogger(DatabaseConnection.class.getName());
    private static HikariDataSource dataSource;

    static {
        try {
            HikariConfig config = new HikariConfig();
            String dbUrl = System.getenv("DB_URL");
            if (dbUrl == null || dbUrl.trim().isEmpty()) {
                dbUrl = "jdbc:mysql://localhost:3306/expirybox?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8";
            }
            String dbUser = System.getenv("DB_USERNAME");
            if (dbUser == null || dbUser.trim().isEmpty()) {
                dbUser = "root";
            }
            String dbPassword = System.getenv("DB_PASSWORD");
            if (dbPassword == null) {
                dbPassword = "";
            }

            config.setJdbcUrl(dbUrl);
            config.setUsername(dbUser);
            config.setPassword(dbPassword);
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setIdleTimeout(30000);
            config.setMaxLifetime(600000);
            config.setConnectionTimeout(10000);

            dataSource = new HikariDataSource(config);
            LOGGER.info("HikariCP DataSource initialized successfully for ExpiryBox.");
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to initialize database connection pool", e);
        }
    }

    private DatabaseConnection() {}

    public static Connection getConnection() throws SQLException {
        if (dataSource == null) {
            throw new SQLException("HikariDataSource is not initialized.");
        }
        return dataSource.getConnection();
    }

    public static void shutdown() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
        }
    }
}
