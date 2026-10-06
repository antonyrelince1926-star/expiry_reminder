package com.expirybox.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a tracked product in ExpiryBox.
 */
public class Product implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long userId;
    private String productName;
    private String brand;
    private String barcode;
    private String category;
    private String packageSize;
    private int quantity;
    private String unit;
    private String batchNumber;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private String expiryType; // expiry, use_by, best_before, unknown
    private String datePrecision; // DAY, MONTH, YEAR
    private String source; // barcode, camera, uploaded_image, manual, combined
    private String notes;
    private String status; // ACTIVE, EXPIRING_SOON, EXPIRING_TODAY, EXPIRING_TOMORROW, EXPIRED, CONSUMED, DISCARDED
    private BigDecimal confidenceScore;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Derived runtime fields
    private long daysUntilExpiry;
    private String expiryDisplayText;

    public Product() {
        this.quantity = 1;
        this.unit = "pcs";
        this.category = "Other";
        this.expiryType = "expiry";
        this.datePrecision = "DAY";
        this.source = "manual";
        this.status = "ACTIVE";
        this.confidenceScore = BigDecimal.valueOf(1.0);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPackageSize() { return packageSize; }
    public void setPackageSize(String packageSize) { this.packageSize = packageSize; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public LocalDate getManufacturingDate() { return manufacturingDate; }
    public void setManufacturingDate(LocalDate manufacturingDate) { this.manufacturingDate = manufacturingDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getExpiryType() { return expiryType; }
    public void setExpiryType(String expiryType) { this.expiryType = expiryType; }

    public String getDatePrecision() { return datePrecision; }
    public void setDatePrecision(String datePrecision) { this.datePrecision = datePrecision; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(BigDecimal confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public long getDaysUntilExpiry() { return daysUntilExpiry; }
    public void setDaysUntilExpiry(long daysUntilExpiry) { this.daysUntilExpiry = daysUntilExpiry; }

    public String getExpiryDisplayText() { return expiryDisplayText; }
    public void setExpiryDisplayText(String expiryDisplayText) { this.expiryDisplayText = expiryDisplayText; }
}
