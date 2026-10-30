package com.hospital.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class PartialIndexInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public PartialIndexInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS uq_appointments_active_slot
                ON appointments (slot_id)
                WHERE status <> 'CANCELLED'
                """);
    }
}
