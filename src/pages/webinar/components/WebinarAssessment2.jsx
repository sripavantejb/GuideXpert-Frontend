import { WEBINAR_ASSESSMENT_2_QUESTIONS } from '../data/webinarAssessment2Questions';
import WebinarAssessmentTemplate from './WebinarAssessmentTemplate';

export default function WebinarAssessment2({ onComplete, nextLabel, onGoNext, webinarToken }) {
  return (
    <WebinarAssessmentTemplate
      assessmentId="a2"
      title="Assessment 2"
      description="Review your Session 2 understanding before unlocking the next module."
      questions={WEBINAR_ASSESSMENT_2_QUESTIONS}
      estimatedTime="5 mins"
      onComplete={onComplete}
      nextLabel={nextLabel}
      onGoNext={onGoNext}
      webinarToken={webinarToken}
    />
  );
}
