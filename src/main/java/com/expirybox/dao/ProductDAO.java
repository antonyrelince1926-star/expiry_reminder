package com.expirybox.dao;

import com.expirybox.model.Product;
import com.expirybox.util.DatabaseConnection;

import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Product entities.
 * Strictly uses PreparedStatements with try-with-resources.
 * Never concatenates raw SQL queries.
 */
public class ProductDAO {

    public Long createProduct(Product product) throws SQLException {
        String sql = """
            INSERT INTO products (
                user_id, product_name, brand, barcode, category, package_size,
                quantity, unit, batch_number, manufacturing_date, expiry_date,
                expiry_type, date_precision, source, notes, status, confidence_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setLong(1, product.getUserId());
            ps.setString(2, product.getProductName());
            ps.setString(3, product.getBrand());
            ps.setString(4, product.getBarcode());
            ps.setString(5, product.getCategory());
            ps.setString(6, product.getPackageSize());
            ps.setInt(7, product.getQuantity());
            ps.setString(8, product.getUnit());
            ps.setString(9, product.getBatchNumber());
            ps.setDate(10, product.getManufacturingDate() != null ? Date.valueOf(product.getManufacturingDate()) : null);
            ps.setDate(11, Date.valueOf(product.getExpiryDate()));
            ps.setString(12, product.getExpiryType());
            ps.setString(13, product.getDatePrecision());
            ps.setString(14, product.getSource());
            ps.setString(15, product.getNotes());
            ps.setString(16, product.getStatus());
            ps.setBigDecimal(17, product.getConfidenceScore());

            ps.executeUpdate();

            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }
        }
        return null;
    }

    public Product getProductById(Long id, Long userId) throws SQLException {
        String sql = "SELECT * FROM products WHERE id = ? AND user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, id);
            ps.setLong(2, userId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToProduct(rs);
                }
            }
        }
        return null;
    }

    public List<Product> getProductsByUser(Long userId, String filterStatus, String category, String search) throws SQLException {
        StringBuilder sql = new StringBuilder("SELECT * FROM products WHERE user_id = ?");
        List<Object> params = new ArrayList<>();
        params.add(userId);

        if (filterStatus != null && !filterStatus.equalsIgnoreCase("ALL")) {
            if ("EXPIRING_SOON_5".equalsIgnoreCase(filterStatus)) {
                sql.append(" AND expiry_date >= CURDATE() AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 5 DAY) AND status NOT IN ('CONSUMED','DISCARDED')");
            } else if ("TODAY".equalsIgnoreCase(filterStatus)) {
                sql.append(" AND expiry_date = CURDATE() AND status NOT IN ('CONSUMED','DISCARDED')");
            } else if ("TOMORROW".equalsIgnoreCase(filterStatus)) {
                sql.append(" AND expiry_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND status NOT IN ('CONSUMED','DISCARDED')");
            } else if ("ACTIVE".equalsIgnoreCase(filterStatus)) {
                sql.append(" AND status = 'ACTIVE' AND expiry_date >= CURDATE()");
            } else if ("EXPIRED".equalsIgnoreCase(filterStatus)) {
                sql.append(" AND (status = 'EXPIRED' OR expiry_date < CURDATE()) AND status NOT IN ('CONSUMED','DISCARDED')");
            } else {
                sql.append(" AND status = ?");
                params.add(filterStatus);
            }
        }

        if (category != null && !category.equalsIgnoreCase("ALL") && !category.trim().isEmpty()) {
            sql.append(" AND category = ?");
            params.add(category);
        }

        if (search != null && !search.trim().isEmpty()) {
            sql.append(" AND (product_name LIKE ? OR brand LIKE ? OR barcode LIKE ? OR batch_number LIKE ?)");
            String pattern = "%" + search.trim() + "%";
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
            params.add(pattern);
        }

        sql.append(" ORDER BY expiry_date ASC, created_at DESC");

        List<Product> products = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    products.add(mapResultSetToProduct(rs));
                }
            }
        }
        return products;
    }

    public boolean updateStatus(Long id, Long userId, String newStatus) throws SQLException {
        String sql = "UPDATE products SET status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, newStatus);
            ps.setLong(2, id);
            ps.setLong(3, userId);

            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteProduct(Long id, Long userId) throws SQLException {
        String sql = "DELETE FROM products WHERE id = ? AND user_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, id);
            ps.setLong(2, userId);

            return ps.executeUpdate() > 0;
        }
    }

    public Product findPossibleDuplicate(Long userId, String barcode, String productName, LocalDate expiryDate) throws SQLException {
        String sql = """
            SELECT * FROM products 
            WHERE user_id = ? 
              AND status NOT IN ('CONSUMED', 'DISCARDED')
              AND ((barcode IS NOT NULL AND barcode != '' AND barcode = ?)
                   OR (product_name = ? AND expiry_date = ?))
            LIMIT 1
        """;
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setLong(1, userId);
            ps.setString(2, barcode != null ? barcode : "");
            ps.setString(3, productName != null ? productName : "");
            ps.setDate(4, expiryDate != null ? Date.valueOf(expiryDate) : Date.valueOf(LocalDate.now()));

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToProduct(rs);
                }
            }
        }
        return null;
    }

    private Product mapResultSetToProduct(ResultSet rs) throws SQLException {
        Product p = new Product();
        p.setId(rs.getLong("id"));
        p.setUserId(rs.getLong("user_id"));
        p.setProductName(rs.getString("product_name"));
        p.setBrand(rs.getString("brand"));
        p.setBarcode(rs.getString("barcode"));
        p.setCategory(rs.getString("category"));
        p.setPackageSize(rs.getString("package_size"));
        p.setQuantity(rs.getInt("quantity"));
        p.setUnit(rs.getString("unit"));
        p.setBatchNumber(rs.getString("batch_number"));

        Date mfg = rs.getDate("manufacturing_date");
        if (mfg != null) p.setManufacturingDate(mfg.toLocalDate());

        Date exp = rs.getDate("expiry_date");
        if (exp != null) p.setExpiryDate(exp.toLocalDate());

        p.setExpiryType(rs.getString("expiry_type"));
        p.setDatePrecision(rs.getString("date_precision"));
        p.setSource(rs.getString("source"));
        p.setNotes(rs.getString("notes"));
        p.setStatus(rs.getString("status"));
        p.setConfidenceScore(rs.getBigDecimal("confidence_score"));
        return p;
    }
}
