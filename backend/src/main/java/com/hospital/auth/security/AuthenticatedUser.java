package com.hospital.auth.security;

import java.security.Principal;

public record AuthenticatedUser(
        Long userId,
        UserRole role,
        Long hospitalId
) implements Principal {

    @Override
    public String getName() {
        return String.valueOf(userId);
    }
}
