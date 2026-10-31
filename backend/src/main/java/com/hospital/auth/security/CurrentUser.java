package com.hospital.auth.security;

import com.hospital.common.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUser {

    public AuthenticatedUser get() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            throw new UnauthorizedException("Authentication is required");
        }

        return user;
    }

    public Long userId() {
        return get().userId();
    }

    public UserRole role() {
        return get().role();
    }

    public Long hospitalId() {
        return get().hospitalId();
    }

    public boolean hasRole(UserRole role) {
        return get().role() == role;
    }
}
