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
    <section className="bg-white relative py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" style={{
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: '#003366',
            lineHeight: '1.1'
          }}>
            Got Questions?
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto" style={{
            fontWeight: '500',
            lineHeight: '1.6',
            color: '#475569'
          }}>
            Find answers to common questions about becoming a GuideXpert Counselor.
          </p>
        </div>

        <div className="space-y-4 mb-12">
          <Accordion items={faqItems} />
        </div>

        <div className="text-center">
          <Button variant="outline" className="px-8 py-3">
            View All FAQs
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;

