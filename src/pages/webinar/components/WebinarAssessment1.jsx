import { WEBINAR_ASSESSMENT_1_QUESTIONS } from '../data/webinarAssessment1Questions';
import WebinarAssessmentTemplate from './WebinarAssessmentTemplate';

export default function WebinarAssessment1({ onComplete, nextLabel, onGoNext, webinarToken }) {
  return (
    <WebinarAssessmentTemplate
      assessmentId="a1"
      title="Assessment 1"
      description="Check your understanding of Session 1 concepts before moving ahead."
      questions={WEBINAR_ASSESSMENT_1_QUESTIONS}
      estimatedTime="5 mins"
      onComplete={onComplete}
      nextLabel={nextLabel}
      onGoNext={onGoNext}
      webinarToken={webinarToken}
    />
  );
}
