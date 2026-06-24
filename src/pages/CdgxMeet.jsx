import IitCounsellingMeetFlow from '../components/IitCounsellingMeetFlow';
import { registerForCollegeDostMeet, checkCollegeDostMeetStatus } from '../utils/api';

/** Public attendance page for /cdgxmeet — OTP verify, register, then Google Meet redirect. */
export default function CdgxMeet() {
  return (
    <IitCounsellingMeetFlow
      meetLink="https://meet.google.com/tmf-hvpb-xhe"
      registerFn={(displayName, phone) => registerForCollegeDostMeet(displayName, phone)}
      checkExistingFn={checkCollegeDostMeetStatus}
      otpOccupationLabel="CollegeDost Meet Attendee"
      pageSubtitle="CollegeDost Meet"
      joinHeading="Join CollegeDost Meet"
      joinDescription="Enter your details to receive an OTP."
      idPrefix="cdgx-meet"
    />
  );
}
