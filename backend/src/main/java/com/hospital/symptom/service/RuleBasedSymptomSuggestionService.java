package com.hospital.symptom.service;

import com.hospital.common.ResourceNotFoundException;
import com.hospital.doctor.DoctorRepository;
import com.hospital.hospital.Department;
import com.hospital.hospital.DepartmentRepository;
import com.hospital.slot.SlotStatus;
import com.hospital.symptom.SymptomKeyword;
import com.hospital.symptom.SymptomKeywordRepository;
import com.hospital.symptom.dto.SuggestedDepartmentResponse;
import com.hospital.symptom.dto.SuggestedDoctorResponse;
import com.hospital.symptom.dto.SuggestedDoctorRow;
import com.hospital.symptom.dto.SymptomSuggestionRequest;
import com.hospital.symptom.dto.SymptomSuggestionResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class RuleBasedSymptomSuggestionService implements SymptomSuggestionService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");
    private static final int MIN_KEYWORD_LENGTH = 3;
    private static final int MAX_ALTERNATIVE_DEPARTMENTS = 2;
    private static final int MAX_DOCTORS = 10;
    private static final String GENERAL_MEDICINE = "General Medicine";
    private static final String EMERGENCY_MESSAGE =
            "This may be a medical emergency. Please call your local emergency number or go to the nearest hospital immediately.";
    private static final String DISCLAIMER =
            "This is a suggestion based on keywords, not a medical diagnosis. Please consult a doctor.";

    private final SymptomKeywordRepository symptomKeywordRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;

    public RuleBasedSymptomSuggestionService(
            SymptomKeywordRepository symptomKeywordRepository,
            DepartmentRepository departmentRepository,
            DoctorRepository doctorRepository
    ) {
        this.symptomKeywordRepository = symptomKeywordRepository;
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public SymptomSuggestionResponse suggest(SymptomSuggestionRequest request) {
        String normalizedText = normalize(request.text());
        LocalDateTime now = LocalDateTime.now(APP_ZONE);

        boolean emergency = false;
        Set<String> matchedKeywords = new LinkedHashSet<>();
        Set<String> matchedKeywordKeys = new HashSet<>();
        Map<Long, Integer> departmentScores = new HashMap<>();
        Map<Long, Department> departmentsById = new HashMap<>();

        for (SymptomKeyword symptomKeyword : symptomKeywordRepository.findAllWithDepartment()) {
            String normalizedKeyword = normalize(symptomKeyword.getKeyword());

            if (normalizedKeyword.length() < MIN_KEYWORD_LENGTH
                    || !normalizedText.contains(normalizedKeyword)) {
                continue;
            }

            Department department = symptomKeyword.getDepartment();
            String matchKey = normalizedKeyword + "|" + department.getId();

            if (!matchedKeywordKeys.add(matchKey)) {
                continue;
            }

            matchedKeywords.add(symptomKeyword.getKeyword().trim());
            departmentScores.merge(department.getId(), normalizedKeyword.length(), Integer::sum);
            departmentsById.put(department.getId(), department);

            if (symptomKeyword.isEmergency()) {
                emergency = true;
            }
        }

        List<RankedDepartment> rankedDepartments = departmentScores.entrySet().stream()
                .map(entry -> new RankedDepartment(
                        departmentsById.get(entry.getKey()),
                        entry.getValue()
                ))
                .sorted(Comparator
                        .comparingInt(RankedDepartment::score)
                        .reversed()
                        .thenComparing(
                                ranked -> ranked.department().getName(),
                                String.CASE_INSENSITIVE_ORDER
                        )
                        .thenComparing(ranked -> ranked.department().getId()))
                .toList();

        boolean matched = !rankedDepartments.isEmpty();
        Department suggestedDepartment;
        List<SuggestedDepartmentResponse> alternativeDepartments;

        if (matched) {
            suggestedDepartment = rankedDepartments.get(0).department();
            alternativeDepartments = rankedDepartments.stream()
                    .skip(1)
                    .limit(MAX_ALTERNATIVE_DEPARTMENTS)
                    .map(ranked -> toDepartmentResponse(ranked.department()))
                    .toList();
        } else {
            suggestedDepartment = departmentRepository.findByNameIgnoreCase(GENERAL_MEDICINE)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "General Medicine department not found"
                    ));
            alternativeDepartments = List.of();
        }

        List<SuggestedDoctorRow> doctorRows = doctorRepository.findSuggestedDoctors(
                suggestedDepartment.getId(),
                now.toLocalDate(),
                now.toLocalTime(),
                SlotStatus.AVAILABLE,
                PageRequest.of(0, MAX_DOCTORS)
        );

        List<SuggestedDoctorResponse> doctors = doctorRows.stream()
                .map(this::toDoctorResponse)
                .toList();

        return new SymptomSuggestionResponse(
                matched,
                emergency,
                emergency ? EMERGENCY_MESSAGE : null,
                toDepartmentResponse(suggestedDepartment),
                alternativeDepartments,
                List.copyOf(matchedKeywords),
                doctors,
                DISCLAIMER
        );
    }

    private SuggestedDepartmentResponse toDepartmentResponse(Department department) {
        return new SuggestedDepartmentResponse(department.getId(), department.getName());
    }

    private SuggestedDoctorResponse toDoctorResponse(SuggestedDoctorRow row) {
        return new SuggestedDoctorResponse(
                row.doctorId(),
                row.name(),
                row.specialization(),
                row.experienceYears(),
                new SuggestedDoctorResponse.Hospital(
                        row.hospitalId(),
                        row.hospitalName(),
                        row.hospitalCity()
                ),
                new SuggestedDoctorResponse.NextAvailableSlot(
                        row.slotId(),
                        row.slotDate(),
                        row.slotStartTime()
                )
        );
    }

    private String normalize(String value) {
        return value.toLowerCase(Locale.ROOT)
                .replace('\u2019', '\'')
                .replace("'", "")
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private record RankedDepartment(Department department, int score) {
    }
}
