import React, { useState, type FormEvent } from 'react';
import { Mail, MapPin, Send, ArrowUp, CheckCircle } from 'lucide-react';
import './ContactSection.css';

interface ContactSectionProps {
  id?: string;
  onAscendClick?: () => void;
}

const TO_EMAIL = 'literati@nitrr.ac.in';

export const ContactSection: React.FC<ContactSectionProps> = ({
  id = 'contact',
  onAscendClick,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedFeedback = feedback.trim();

    if (!trimmedName || !trimmedEmail || !trimmedFeedback) return;

    const subject = 'Website Feedback - LITFEST 2.0';
    const body = [
      `Name: ${trimmedName}`,
      `From: ${trimmedEmail}`,
      `Contact No: ${trimmedPhone || 'Not provided'}`,
      `\nFeedback / Message:`,
      trimmedFeedback,
    ].join('\n\n');

    const mailtoLink = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setIsSubmitted(true);
    window.location.href = mailtoLink;
  };

  return (
    <section id={id} className="contact-section-wrapper" aria-label="Contact Us Section">
      {/* Background ambient lighting matching FAQ and Sponsors */}
      <div className="ocean-ambient-canvas" aria-hidden="true">
        <div className="ocean-wave-glow glow-1" />
        <div className="ocean-wave-glow glow-2" />
      </div>

      <div className="contact-main-container">
        {/* Navy Blue Contact Card */}
        <div className="contact-card">
          <header className="contact-card-header">
            <h2 className="contact-card-title">Contact Us</h2>
            <p className="contact-card-subtitle">
              Get in touch with the Literati organizing committee for queries, delegate registrations, and festival partnerships.
            </p>
          </header>

          {isSubmitted && (
            <div className="contact-status-banner" role="status">
              <CheckCircle size={18} className="contact-status-icon" />
              <span>Opening your email client to dispatch to {TO_EMAIL}</span>
            </div>
          )}

          <form className="contact-form-body" onSubmit={handleSubmit}>
            <div className="contact-field-group">
              <label htmlFor="contact-name">Your Name</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                placeholder="Your Name"
                pattern="[^0-9]*"
                title="Numbers are not allowed in your name."
                value={name}
                onChange={(e) => setName(e.target.value.replace(/[0-9]/g, ''))}
                required
                autoComplete="name"
              />
            </div>

            <div className="contact-field-group">
              <label htmlFor="contact-phone">Your Contact No</label>
              <input
                type="tel"
                id="contact-phone"
                name="PhoneNo"
                placeholder="XXXXXXXXXX"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                title="Enter a 10-digit phone number (digits only)."
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                autoComplete="tel"
              />
            </div>

            <div className="contact-field-group">
              <label htmlFor="contact-email">Your Email</label>
              <input
                type="email"
                id="contact-email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="contact-field-group">
              <label htmlFor="contact-feedback">Your Feedback / Message</label>
              <textarea
                id="contact-feedback"
                name="feedback"
                rows={5}
                minLength={20}
                placeholder="Write your message or inquiry here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="contact-submit-btn" id="contact-submit-btn">
              <span>Send Message</span>
              <Send size={16} aria-hidden="true" />
            </button>
          </form>

          {/* Direct Communication Channels */}
          <div className="contact-direct-channels">
            <a href={`mailto:${TO_EMAIL}`} className="contact-channel-pill" title="Send email directly">
              <Mail size={14} />
              <span>{TO_EMAIL}</span>
            </a>
            <div className="contact-channel-pill" title="Festival Venue">
              <MapPin size={14} />
              <span>NIT Raipur, CG</span>
            </div>
          </div>
        </div>

        {/* Return to Surface Ascent Button */}
        {onAscendClick && (
          <div className="contact-surface-wrap">
            <button
              type="button"
              className="contact-surface-btn"
              onClick={onAscendClick}
              title="Return to Litfest 2.0 Surface"
              aria-label="Return to surface"
            >
              <ArrowUp size={14} aria-hidden="true" />
              <span>Return to Surface</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactSection;
