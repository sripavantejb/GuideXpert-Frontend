import { WEBINAR_ASSESSMENT_4_QUESTIONS } from '../data/webinarAssessment4Questions';
import WebinarAssessmentTemplate from './WebinarAssessmentTemplate';

export default function WebinarAssessment4({ onComplete, nextLabel, onGoNext, webinarToken }) {
  return (
    <WebinarAssessmentTemplate
      assessmentId="a4"
      title="Assessment 4"
      description="Complete this checkpoint to confirm readiness for the next learning step."
      questions={WEBINAR_ASSESSMENT_4_QUESTIONS}
      estimatedTime="5 mins"
      onComplete={onComplete}
      nextLabel={nextLabel}
      onGoNext={onGoNext}
      webinarToken={webinarToken}
    />
  );
}
