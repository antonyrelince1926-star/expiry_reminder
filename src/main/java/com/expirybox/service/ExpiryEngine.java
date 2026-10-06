package com.expirybox.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Deterministic Expiry Engine.
 * Responsible for all date mathematics, 5-day reminder rules, and status determination.
 * Note: Gemini is strictly prohibited from performing reminder calculations.
 */
public class ExpiryEngine {

    /**
     * Calculates days until expiry from currentDate to expiryDate.
     * Positive = days remaining in future.
     * Zero = expires today.
     * Negative = expired in past.
     */
    public long calculateDaysUntilExpiry(LocalDate expiryDate, LocalDate currentDate) {
        if (expiryDate == null || currentDate == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(currentDate, expiryDate);
    }

    /**
     * Determines product operational status based on days remaining.
     */
    public String calculateExpiryStatus(LocalDate expiryDate, LocalDate currentDate) {
        if (expiryDate == null || currentDate == null) {
            return "UNKNOWN";
        }
        long days = calculateDaysUntilExpiry(expiryDate, currentDate);
        if (days < 0) {
            return "EXPIRED";
        } else if (days == 0) {
            return "EXPIRING_TODAY";
        } else if (days == 1) {
            return "EXPIRING_TOMORROW";
        } else if (days <= 5) {
            return "EXPIRING_SOON";
        } else {
            return "ACTIVE";
        }
    }

    /**
     * Human-friendly display text for cards and alerts.
     */
    public String getExpiryDisplayText(LocalDate expiryDate, LocalDate currentDate, String productName) {
        long days = calculateDaysUntilExpiry(expiryDate, currentDate);
        if (days < 0) {
            long pastDays = Math.abs(days);
            return pastDays == 1 ? productName + " expired yesterday." : productName + " expired " + pastDays + " days ago.";
        } else if (days == 0) {
            return productName + " expires today!";
        } else if (days == 1) {
            return productName + " expires tomorrow.";
        } else {
            return productName + " expires in " + days + " days.";
        }
    }

    /**
     * Central 5-Day Reminder Rule:
     * Generates notification types if expiry is within 5 days.
     */
    public String getNotificationTypeForDate(LocalDate expiryDate, LocalDate currentDate) {
        long days = calculateDaysUntilExpiry(expiryDate, currentDate);
        if (days == 5) return "EXPIRING_IN_5_DAYS";
        if (days == 4) return "EXPIRING_IN_4_DAYS";
        if (days == 3) return "EXPIRING_IN_3_DAYS";
        if (days == 2) return "EXPIRING_IN_2_DAYS";
        if (days == 1) return "EXPIRING_TOMORROW";
        if (days == 0) return "EXPIRING_TODAY";
        if (days == -1) return "EXPIRED";
        return null;
    }

    /**
     * Handles Month/Year precision dates (e.g. EXP 10/2026).
     * Normalizes to the end of the specified month according to documented policy.
     */
    public LocalDate normalizeMonthYearExpiry(int year, int month) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        return startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
    }
}
