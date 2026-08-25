import MeetingRegistration from './MeetingRegistration';

const ACTIVATION_COUNSELLOR_MEET_URL = 'https://meet.google.com/wpz-wusj-iej';

export default function ActivationCounsellorsGmeet() {
  return (
    <MeetingRegistration
      variant="activation-counsellor"
      redirectMeetUrl={ACTIVATION_COUNSELLOR_MEET_URL}
    />
  );
}
