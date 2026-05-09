import IitCounsellingMeetFlow from '../components/IitCounsellingMeetFlow';
import { registerForIitMeet } from '../utils/api';

/** Public attendance page for the IIT counselling meet — POST /api/iit-meet/register, then Meet redirect. */
export default function IitCounsellingMeet() {
  return (
    <IitCounsellingMeetFlow
      meetLink="https://meet.google.com/woo-pufk-bgz"
      registerFn={(displayName, phone) => registerForIitMeet(displayName, phone)}
      otpOccupationLabel="IIT Meet Attendee"
      pageSubtitle="IIT Counselling Meet"
      joinHeading="Join IIT Counselling Meet"
      joinDescription="Enter your details to receive an OTP."
      idPrefix="iit-meet"
    />
  );
}
