import { useEffect } from 'react';

const TRAINING_MEET_LINK = 'https://meet.google.com/nhb-csvx-sju';

export default function TrainingRedirect() {
  useEffect(() => {
    // Script redirect
    window.location.replace(TRAINING_MEET_LINK);
    // Meta refresh as well (declarative; may work when script is blocked)
    const meta = document.createElement('meta');
    meta.httpEquiv = 'refresh';
    meta.content = `0;url=${TRAINING_MEET_LINK}`;
    document.head.appendChild(meta);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">GuideXpert</h1>
        <p className="text-gray-600">Redirecting to training Meet...</p>
        <p className="mt-4 text-sm text-gray-500">
          If you are not redirected,{' '}
          <a href={TRAINING_MEET_LINK} target="_self" rel="noopener noreferrer" className="text-blue-700 hover:underline">
            click here to join the meeting
          </a>
          .
        </p>
      </div>
    </div>
  );
}
