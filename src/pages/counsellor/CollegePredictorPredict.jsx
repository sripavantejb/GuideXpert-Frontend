import CollegePredictorEngine from '../../components/collegePredictor/CollegePredictorEngine';
import { getPredictedColleges } from '../../utils/counsellorApi';

/** Counsellor portal college predictor — authenticated API, no OTP gate. */
export default function CollegePredictorPredict() {
  return (
    <CollegePredictorEngine
      predictApi={getPredictedColleges}
      examsListPath="/counsellor/tools/college-predictor"
      requireLeadGate={false}
      hideChrome={false}
    />
  );
}
