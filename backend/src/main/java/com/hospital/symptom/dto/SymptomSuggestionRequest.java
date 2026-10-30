package com.hospital.symptom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SymptomSuggestionRequest(
        @NotBlank(message = "Text is required")
        @Size(max = 500, message = "Text must not exceed 500 characters")
        String text
) {
}
