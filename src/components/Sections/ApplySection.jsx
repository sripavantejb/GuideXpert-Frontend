import { useState } from 'react';
import ApplyFormModal from '../UI/ApplyFormModal';
import Button from '../UI/Button';

const ApplySection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Apply to Become a GuideXpert Counselor
          </h2>
          <p className="text-xl text-gray-600">
            Ready to embark on a rewarding journey as a certified GuideXpert Counselor? Fill out the form below to get started.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-xl p-8 md:p-12 text-center">
          <p className="text-gray-700 mb-8 text-lg">
            Take the first step towards a fulfilling career. Join our network of certified counselors and make a real difference in students' lives.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="px-8 py-4 text-lg">
            Start Your Application
          </Button>
        </div>

        <ApplyFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Apply to Become a GuideXpert Counselor"
        />
      </div>
    </section>
  );
};

export default ApplySection;

