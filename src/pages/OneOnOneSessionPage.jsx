import { useEffect } from 'react';
import OneOnOneSessionBookingForm from '../components/oneOnOneSession/OneOnOneSessionBookingForm';

export default function OneOnOneSessionPage() {
  useEffect(() => {
    document.title = 'Book 1-on-1 IITian Career Counseling | GuideXpert';
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 selection:bg-[#c7f36b] selection:text-[#0F172A] sm:px-6">
      <div className="mx-auto max-w-4xl">
        <OneOnOneSessionBookingForm showIntro />
      </div>
    </div>
  );
}
