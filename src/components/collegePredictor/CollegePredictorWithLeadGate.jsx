import CollegePredictorEngine from './CollegePredictorEngine';
import { getPredictedCollegesPublic } from '../../utils/api';

/**
 * Student college predictor: form → name/phone OTP → public college API → results.
 */
export default function CollegePredictorWithLeadGate({
  onMatchCount = null,
  examsListPath = '/students/college-predictor',
}) {
  return (
    <CollegePredictorEngine
      predictApi={getPredictedCollegesPublic}
      examsListPath={examsListPath}
      requireLeadGate
      hideChrome
      onMatchCount={onMatchCount}
    />
  );
}
