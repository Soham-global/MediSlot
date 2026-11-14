import client from "./client";

function normalizeSuggestion(data) {
  return {
    ...data,
    department: data.suggestedDepartment || null,
    isEmergency: Boolean(data.emergency),
    alternatives: data.alternativeDepartments || [],
    doctors: data.doctors || [],
  };
}

export const symptomsApi = {
  suggestSymptoms: (text) =>
    client
      .post("/api/symptoms/suggest", { text })
      .then((response) => normalizeSuggestion(response.data)),
};
