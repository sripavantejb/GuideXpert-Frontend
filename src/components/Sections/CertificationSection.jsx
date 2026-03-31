import { useState, useEffect } from 'react';
import { FiBook, FiTool, FiLayers, FiAward } from 'react-icons/fi';
import AnimatedElement from '../UI/AnimatedElement';
import { getCertificatePngDataUrl, formatCertificateDate } from '../../pages/webinar/utils/certificateWebinar';
import './CertificationSection.css';

const SAMPLE_NAME = 'Tej';

const CertificationSection = () => {
  const [certPreviewUrl, setCertPreviewUrl] = useState(null);
  const [certLoading, setCertLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const dateStr = formatCertificateDate();
    getCertificatePngDataUrl(SAMPLE_NAME, dateStr, undefined)
      .then((url) => {
        if (!cancelled) setCertPreviewUrl(url);
      })
      .catch(() => {
        if (!cancelled) setCertPreviewUrl(null);
      })
      .finally(() => {
        if (!cancelled) setCertLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const benefits = [
    {
      icon: FiBook,
      title: 'Expert Training',
      description: 'Led by experienced industry professionals with proven track records in career counseling and student guidance.',
    },
    {
      icon: FiTool,
      title: 'Practical Skill-Based Learning',
      description: 'Hands-on training with real-world scenarios, case studies, and interactive sessions to build confidence.',
    },
    {
      icon: FiLayers,
      title: 'Comprehensive Curriculum',
      description: 'Covering career assessment, counseling techniques, college admissions, exam guidance, and student psychology.',
    },
    {
      icon: FiAward,
      title: 'Industry-Recognized Certification',
      description: 'Earn a professional certificate that establishes credibility with students and parents.',
    },
  ];

  return (
    <section className="certification-section py-16 md:py-24">
      <div className="certification-section-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <AnimatedElement variant="slideUp" delay={0} duration={0.35}>
            <h2 className="mb-4">
              Become a Certified GuideXpert Counselor
            </h2>
          </AnimatedElement>
          <AnimatedElement variant="slideUp" delay={0.1} duration={0.35}>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto" style={{
              fontWeight: '500',
              lineHeight: '1.6',
              color: '#475569'
            }}>
              Our comprehensive certification program equips you with the knowledge and skills to excel as a professional career counselor for admission counselling and student career guidance across India.
            </p>
          </AnimatedElement>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Benefits */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <AnimatedElement
                  key={index}
                  variant="fadeInUp"
                  delay={0.2 + index * 0.1}
                  duration={0.4}
                  className="flex items-start space-x-4"
                >
                  <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{
                    backgroundColor: '#003366'
                  }}>
                    <Icon className="w-5 h-5 text-white" aria-hidden />
                  </div>
                  <div className="flex-1 pt-0.5 min-w-0">
                    <h3 className="text-lg font-semibold mb-1.5" style={{
                      fontWeight: '600',
                      color: '#003366'
                    }}>
                      {benefit.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{
                      color: '#475569',
                      lineHeight: '1.6'
                    }}>
                      {benefit.description}
                    </p>
                  </div>
                </AnimatedElement>
              );
            })}
          </div>

          {/* Right Side - Same certificate render as webinar portal */}
          <AnimatedElement variant="scaleIn" delay={0.6} duration={0.4}>
            <div className="flex justify-center w-full">
              <div
                className="rounded-lg shadow-xl max-w-lg w-full overflow-hidden bg-white border border-gray-100"
                style={{
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  aspectRatio: '842 / 596',
                }}
              >
                {certLoading && (
                  <div
                    className="w-full h-full min-h-[220px] flex items-center justify-center bg-slate-50 text-sm text-slate-500"
                    aria-busy="true"
                    aria-live="polite"
                  >
                    Loading certificate preview…
                  </div>
                )}
                {!certLoading && certPreviewUrl && (
                  <img
                    src={certPreviewUrl}
                    alt="GuideXpert certificate preview (same design as training webinar)"
                    className="w-full h-full object-contain block"
                    width={842}
                    height={596}
                    loading="lazy"
                  />
                )}
                {!certLoading && !certPreviewUrl && (
                  <img
                    src="/certificate-webinar.svg"
                    alt="GuideXpert certificate"
                    className="w-full h-full object-contain block"
                    width={842}
                    height={596}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
};

export default CertificationSection;
