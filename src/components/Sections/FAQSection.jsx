import Accordion from '../UI/Accordion';
import Button from '../UI/Button';

const FAQSection = () => {
  const faqItems = [
    {
      title: 'What are the eligibility criteria?',
      content: 'To become a GuideXpert Counselor, you should have a passion for helping students, relevant educational background or experience in counseling, and the ability to commit to our training program. No prior certification is required.',
    },
    {
      title: 'How long does the certification program take?',
      content: 'The certification program consists of 25 hours of comprehensive training. You can complete it at your own pace, though most counselors finish within 4-6 weeks.',
    },
    {
      title: 'What kind of support do I receive?',
      content: 'As a GuideXpert Counselor, you receive ongoing support including access to our counselor toolkit, marketing assistance, performance dashboards, and a dedicated support team to help you succeed.',
    },
    {
      title: 'Is there a fee for the program?',
      content: 'The certification program includes all training materials, resources, and ongoing support. Details about any associated fees will be provided during the application process.',
    },
    {
      title: 'Can I work part-time or full-time?',
      content: 'Yes! GuideXpert offers flexible working hours. You can work part-time or full-time based on your schedule and availability. Many of our counselors work from home.',
    },
    {
      title: 'What is the earning potential?',
      content: 'Earning potential varies based on your level and the number of students you counsel. Beginner counselors can earn around ₹1,00,000, intermediate counselors around ₹5,00,000, and elite counselors can earn ₹10,00,000 or more annually.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Got Questions?
          </h2>
          <p className="text-xl text-gray-600">
            Find answers to common questions about becoming a GuideXpert Counselor.
          </p>
        </div>

        <Accordion items={faqItems} />

        <div className="text-center mt-8">
          <Button variant="outline">
            View All FAQs
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

