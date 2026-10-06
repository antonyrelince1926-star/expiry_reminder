package com.expirybox.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Notification implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long userId;
    private Long productId;
    private String productName;
    private LocalDate notificationDate;
    private String notificationType;
    private String message;
    private boolean isRead;
    private boolean sent;
    private LocalDateTime createdAt;

    public Notification() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public LocalDate getNotificationDate() { return notificationDate; }
    public void setNotificationDate(LocalDate notificationDate) { this.notificationDate = notificationDate; }

    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public boolean isSent() { return sent; }
    public void setSent(boolean sent) { this.sent = sent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
