import { WEBINAR_ASSESSMENT_5_QUESTIONS } from '../data/webinarAssessment5Questions';
import WebinarAssessmentTemplate from './WebinarAssessmentTemplate';

export default function WebinarAssessment5({ onComplete, nextLabel, onGoNext, webinarToken }) {
  return (
    <WebinarAssessmentTemplate
      assessmentId="a5"
      title="Assessment 5"
      description="Finish the final assessment to complete this webinar learning track."
      questions={WEBINAR_ASSESSMENT_5_QUESTIONS}
      estimatedTime="5 mins"
      onComplete={onComplete}
      nextLabel={nextLabel}
      onGoNext={onGoNext}
      webinarToken={webinarToken}
    />
  );
}
