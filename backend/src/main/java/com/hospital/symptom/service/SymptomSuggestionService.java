package com.hospital.symptom.service;

import com.hospital.symptom.dto.SymptomSuggestionRequest;
import com.hospital.symptom.dto.SymptomSuggestionResponse;

public interface SymptomSuggestionService {

    SymptomSuggestionResponse suggest(SymptomSuggestionRequest request);
}
