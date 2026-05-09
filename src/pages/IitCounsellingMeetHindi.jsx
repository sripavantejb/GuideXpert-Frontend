import IitCounsellingMeetFlow from '../components/IitCounsellingMeetFlow';
import { registerForIitMeetHindi } from '../utils/api';

/** Hindi meet attendance — separate DB collection via POST /api/iit-meet-hindi/register. */
export default function IitCounsellingMeetHindi() {
  return (
    <IitCounsellingMeetFlow
      meetLink="https://meet.google.com/uzn-kpoq-gyb"
      registerFn={(displayName, phone) => registerForIitMeetHindi(displayName, phone)}
      otpOccupationLabel="IIT Meet Hindi Attendee"
      pageSubtitle="IIT Counselling Meet (Hindi)"
      joinHeading="Join IIT Counselling Meet (Hindi)"
      joinDescription="Enter your details to receive an OTP."
      idPrefix="iit-meet-hindi"
    />
  );
}
