package com.hospital.symptom;

import com.hospital.config.BaseEntity;
import com.hospital.hospital.Department;
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
@Table(name = "symptom_keywords")
@Getter
@Setter
@NoArgsConstructor
public class SymptomKeyword extends BaseEntity {

    @Column(name = "keyword", nullable = false, length = 120)
    private String keyword;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "is_emergency", nullable = false)
    private boolean emergency;
}
