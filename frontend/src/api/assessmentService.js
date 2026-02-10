
import axios from "./axiosInstance";

/**
 * Start assessment
 * Fetch assessment details + questions
 */
export const startAssessment = (assessmentId) => {
  return axios.get(`/assessments/assessment/${assessmentId}`);
};
/**
 * Submit assessment answers
 */
export const submitAssessment = (assessmentId, answers) => {
  return axios.post(
    `/assessments/submit/${assessmentId}`,
    { answers }
  );
};
