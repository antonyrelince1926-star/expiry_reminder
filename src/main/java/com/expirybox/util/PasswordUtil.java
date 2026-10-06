package com.expirybox.util;

import at.favre.lib.crypto.bcrypt.BCrypt;

/**
 * BCrypt password hashing and verification utility.
 * Plain-text passwords are never stored or logged.
 */
public class PasswordUtil {
    private static final int WORK_FACTOR = 12;

    public static String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        return BCrypt.withDefaults().hashToString(WORK_FACTOR, plainPassword.toCharArray());
    }

    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null) {
            return false;
        }
        BCrypt.Result result = BCrypt.verifyer().verify(plainPassword.toCharArray(), hashedPassword);
        return result.verified;
    }
}
