package com.expirybox.model;

import java.io.Serializable;
import java.time.LocalTime;

public class NotificationSettings implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long userId;
    private boolean enabled;
    private LocalTime notificationTime;
    private boolean expiryDayEnabled;
    private boolean postExpiryEnabled;
    private int remindDaysBefore;

    public NotificationSettings() {
        this.enabled = true;
        this.notificationTime = LocalTime.of(8, 0);
        this.expiryDayEnabled = true;
        this.postExpiryEnabled = true;
        this.remindDaysBefore = 5;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public LocalTime getNotificationTime() { return notificationTime; }
    public void setNotificationTime(LocalTime notificationTime) { this.notificationTime = notificationTime; }

    public boolean isExpiryDayEnabled() { return expiryDayEnabled; }
    public void setExpiryDayEnabled(boolean expiryDayEnabled) { this.expiryDayEnabled = expiryDayEnabled; }

    public boolean isPostExpiryEnabled() { return postExpiryEnabled; }
    public void setPostExpiryEnabled(boolean postExpiryEnabled) { this.postExpiryEnabled = postExpiryEnabled; }

    public int getRemindDaysBefore() { return remindDaysBefore; }
    public void setRemindDaysBefore(int remindDaysBefore) { this.remindDaysBefore = remindDaysBefore; }
}
