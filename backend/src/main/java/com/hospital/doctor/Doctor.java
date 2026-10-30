package com.hospital.doctor;

import com.hospital.config.BaseEntity;
import com.hospital.hospital.Department;
import com.hospital.hospital.Hospital;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
public class Doctor extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "specialization", nullable = false, length = 120)
    private String specialization;

    @Column(name = "qualification", nullable = false, length = 150)
    private String qualification;

    @Column(name = "experience_years", nullable = false)
    private int experienceYears;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
