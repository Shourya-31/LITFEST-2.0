import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  MapPin,
  Mail,
  Instagram,
  BookOpen,
  MessageSquareQuote,
  ShieldCheck,
  Send
} from 'lucide-react';
import { LITFEST_FAQS } from './faqData';
import { FaqItem, FaqCategory, FaqSectionProps } from '../../types/faq';
import { soundEngine } from '../../utils/soundEngine';

export const FaqSection: React.FC<FaqSectionProps> = ({
  faqs = LITFEST_FAQS,
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know regarding participation, events, guidelines, and logistics for LitFest 2.0 at NIT Raipur.",
  className = ""
}) => {
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openFaqId, setOpenFaqId] = useState<string | null>(faqs[0]?.id || null);

  const categories: { key: FaqCategory; label: string }[] = [
    { key: 'all', label: 'All Inquiries' },
    { key: 'general', label: 'General & Society' },
    { key: 'events', label: 'Events & MUN' },
    { key: 'registration', label: 'Registration & Fees' },
    { key: 'logistics', label: 'Logistics & Venue' }
  ];

  // Filter FAQs by category and live search term
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === 'all' || faq.category === activeCategory;
      const qLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !qLower ||
        faq.question.toLowerCase().includes(qLower) ||
        faq.answer.toLowerCase().includes(qLower) ||
        faq.tag.toLowerCase().includes(qLower);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  const handleToggle = (id: string, isOpen: boolean) => {
    soundEngine.playDroplet();
    setOpenFaqId(isOpen ? id : null);
  };

  return (
    <section
      id="faq"
      className={`faq-section-wrapper ${className}`}
      aria-label="Frequently Asked Questions Section"
    >
      {/* Background ambient lighting */}
      <div className="ocean-ambient-canvas" aria-hidden="true">
        <div className="ocean-wave-glow glow-1" />
      </div>

      <div className="faq-main-container">
        {/* Section Header */}
        <header className="faq-section-header">
          <div className="faq-eyebrow">
            <HelpCircle size={14} className="faq-eyebrow-icon" />
            <span>THE CAPTAIN'S DESK & QUERIES</span>
          </div>
          <h2 className="faq-title">{title}</h2>
          <p className="faq-subtitle">{subtitle}</p>

          {/* Search Bar */}
          <div className="faq-search-wrapper">
            <Search className="faq-search-icon" size={18} />
            <input
              type="text"
              id="faq-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions on MUN, Aircrash, fees, accommodation..."
              className="faq-search-input"
              aria-label="Search FAQs"
            />
            {searchQuery && (
              <button
                type="button"
                className="faq-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <nav className="faq-categories-nav" aria-label="FAQ Categories">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className={`category-pill interactive ${activeCategory === cat.key ? 'active' : ''}`}
                onClick={() => {
                  soundEngine.playDroplet();
                  setActiveCategory(cat.key);
                }}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </header>

        {/* 2-Column Grid: Left Accordion & Right Support Card */}
        <div className="faq-content-grid">
          {/* LEFT: Native Semantic <details> Accordion Group */}
          <div className="faq-accordion-column">
            {filteredFaqs.length === 0 ? (
              <div className="faq-empty-state">
                <HelpCircle size={36} className="empty-icon" />
                <h3>No queries found matching "{searchQuery}"</h3>
                <p>Try searching with another keyword or browse all categories.</p>
                <button
                  type="button"
                  className="reset-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="faq-details-group">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <details
                      key={faq.id}
                      name="litfest-faq-exclusive"
                      className={`faq-detail-item ${isOpen ? 'is-open' : ''}`}
                      open={isOpen}
                      onToggle={(e) => {
                        const target = e.currentTarget;
                        handleToggle(faq.id, target.open);
                      }}
                    >
                      <summary className="faq-summary interactive">
                        <div className="faq-summary-content">
                          <span className="faq-tag-pill">{faq.tag}</span>
                          <span className="faq-question-title">{faq.question}</span>
                        </div>
                        <div className="faq-chevron-wrap">
                          <ChevronDown size={18} className="faq-chevron-icon" />
                        </div>
                      </summary>

                      <div className="faq-answer-panel">
                        <p className="faq-answer-text">{faq.answer}</p>
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Literati Captain's Office & Contact Info Card */}
          <aside className="faq-support-column">
            <div className="literati-office-card">
              <div className="office-card-header">
                <div className="office-insignia">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h3 className="office-heading">Literati Secretariat</h3>
                  <p className="office-sub">Official Literary Committee • NIT Raipur</p>
                </div>
              </div>

              <p className="office-desc">
                Have an inquiry about committee delegation rules, outstation stay, or sponsorship tie-ups? Reach our student coordinators directly.
              </p>

              <div className="office-details-list">
                <div className="office-detail-row">
                  <MapPin size={18} className="detail-icon" />
                  <div>
                    <strong>National Institute of Technology Raipur</strong>
                    <p>G.E. Road, Raipur, Chhattisgarh – 492010, India</p>
                  </div>
                </div>

                <div className="office-detail-row">
                  <Mail size={18} className="detail-icon" />
                  <div>
                    <strong>Official Communication</strong>
                    <p>literati@nitrr.ac.in • litfestnitrr@gmail.com</p>
                  </div>
                </div>

                <div className="office-detail-row">
                  <Instagram size={18} className="detail-icon" />
                  <div>
                    <strong>Instagram Updates</strong>
                    <p>@literati_nitrr • @litfest_nitrr</p>
                  </div>
                </div>

                <div className="office-detail-row">
                  <ShieldCheck size={18} className="detail-icon" />
                  <div>
                    <strong>Shilpi Annual Magazine</strong>
                    <p>Publisher of the official bilingual campus magazine</p>
                  </div>
                </div>
              </div>

              <div className="office-card-footer">
                <a
                  href="mailto:literati@nitrr.ac.in?subject=LitFest%202.0%20Inquiry"
                  className="office-contact-btn interactive"
                >
                  <Send size={15} />
                  <span>Send Direct Inquiry</span>
                </a>
              </div>
            </div>

            {/* Quick Tips Callout */}
            <div className="faq-quick-tip-card">
              <MessageSquareQuote size={20} className="tip-icon" />
              <div>
                <strong>Need Immediate Assistance during Fest Days?</strong>
                <p>Visit the Central Registration Desk at HIRA Hall entrance for spot entry passes and delegate badges.</p>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </section>
  );
};

export default FaqSection;
