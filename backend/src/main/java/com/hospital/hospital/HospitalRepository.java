package com.hospital.hospital;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    List<Hospital> findByActiveTrue();

    List<Hospital> findByActiveTrueOrderByNameAsc();

    Optional<Hospital> findByIdAndActiveTrue(Long id);

    List<Hospital> findByCityIgnoreCase(String city);
}
