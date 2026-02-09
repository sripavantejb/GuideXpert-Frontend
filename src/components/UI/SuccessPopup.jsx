import { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import './SuccessPopup.css';

const SuccessPopup = ({ isOpen, onClose, slotInfo, variant = 'slot', score, maxScore }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [checkmarkVisible, setCheckmarkVisible] = useState(false);
  const isPostRegistration = variant === 'postRegistration';
  const isAssessment = variant === 'assessment';

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger checkmark animation after a short delay
      setTimeout(() => setCheckmarkVisible(true), 150);
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setCheckmarkVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setCheckmarkVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for fade-out animation
  };

  if (!isOpen && !isVisible) return null;

  const formatSlotDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[date.getDay()];
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dayName}, ${months[date.getMonth()]} ${date.getDate()} | ${timeStr}`;
  };

  const getSlotLabel = (slot) => {
    if (!slot || typeof slot !== 'string') return slot || '';
    const dayTimeMatch = slot.match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)_(7PM|11AM|3PM)$/i);
    if (dayTimeMatch) {
      const day = dayTimeMatch[1];
      const time = dayTimeMatch[2];
      const dayNames = { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' };
      const timeLabel = time === '7PM' ? '7:00 PM' : time === '11AM' ? '11:00 AM' : '3:00 PM';
      return `${dayNames[day] || day} ${timeLabel}`;
    }
    return slot;
  };

  return (
    <div 
      className={`success-popup-overlay ${isVisible ? 'success-popup-visible' : ''}`}
      onClick={handleClose}
    >
      <div 
        className={`success-popup-container ${isVisible ? 'success-popup-container-visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-popup-content">
          <div className={`success-checkmark-wrapper ${checkmarkVisible ? 'success-checkmark-animated' : ''}`}>
            <div className="success-checkmark-circle">
              <FiCheck className="success-checkmark-icon" />
            </div>
          </div>
          
          <h2 className="success-popup-title">
            {isPostRegistration ? 'Registration Complete!' : isAssessment ? 'Assessment submitted successfully!' : 'Slot Booked Successfully!'}
          </h2>
          
          {isAssessment && (
            <div className="success-slot-info">
              <p className="success-slot-label">Your score</p>
              <p className="success-slot-value">
                {score ?? 0} / {maxScore ?? 12}
              </p>
            </div>
          )}
          {!isPostRegistration && !isAssessment && slotInfo && (
            <div className="success-slot-info">
              <p className="success-slot-label">Your booked slot:</p>
              <p className="success-slot-value">
                {getSlotLabel(slotInfo.selectedSlot)}
              </p>
              {slotInfo.slotDate && (
                <p className="success-slot-date">
                  {formatSlotDate(slotInfo.slotDate)}
                </p>
              )}
            </div>
          )}
          
          <p className="success-popup-message">
            {isAssessment
              ? 'Thank you for completing the counsellor assessment.'
              : isPostRegistration
                ? "We'll send the meeting link and updates to your email."
                : "We'll send you a reminder before your demo session."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;
