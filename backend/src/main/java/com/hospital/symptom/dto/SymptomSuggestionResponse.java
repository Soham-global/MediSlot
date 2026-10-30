package com.hospital.symptom.dto;

import java.util.List;

public record SymptomSuggestionResponse(
        boolean matched,
        boolean emergency,
        String emergencyMessage,
        SuggestedDepartmentResponse suggestedDepartment,
        List<SuggestedDepartmentResponse> alternativeDepartments,
        List<String> matchedKeywords,
        List<SuggestedDoctorResponse> doctors,
        String disclaimer
) {
}
