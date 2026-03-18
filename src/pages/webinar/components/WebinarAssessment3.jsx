import { WEBINAR_ASSESSMENT_3_QUESTIONS } from '../data/webinarAssessment3Questions';
import WebinarAssessmentTemplate from './WebinarAssessmentTemplate';

export default function WebinarAssessment3({ onComplete, nextLabel, onGoNext, webinarToken }) {
  return (
    <WebinarAssessmentTemplate
      assessmentId="a3"
      title="Assessment 3"
      description="Validate your grasp of Session 3 concepts and practical workflows."
      questions={WEBINAR_ASSESSMENT_3_QUESTIONS}
      estimatedTime="5 mins"
      onComplete={onComplete}
      nextLabel={nextLabel}
      onGoNext={onGoNext}
      webinarToken={webinarToken}
    />
  );
}
