import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown
} from 'lucide-react';
import { LITFEST_FAQS } from './faqData';
import type { FaqCategory, FaqSectionProps } from '../../types/faq';
import { soundEngine } from '../../utils/soundEngine';
import '../../styles/faq.css';

export const FaqSection: React.FC<FaqSectionProps> = ({
  faqs = LITFEST_FAQS,
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know regarding participation, events, guidelines, and logistics for LitFest 2.0 at NIT Raipur.",
  className = "",
  onAscendClick,
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
      data-lenis-prevent
      aria-label="Frequently Asked Questions Section"
    >
      {/* Background ambient lighting */}
      <div className="ocean-ambient-canvas" aria-hidden="true">
        <div className="ocean-wave-glow glow-1" />
      </div>

      <div className="faq-main-container">
        {/* Section Header */}
        <header className="faq-section-header">
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
        </div>

        {onAscendClick && (
          <div className="faq-surface-wrap" style={{ display: 'flex', justifyContent: 'center', marginTop: '3.5rem' }}>
            <button
              type="button"
              className="about-surface-link"
              onClick={onAscendClick}
              title="Return to Upper Surface"
            >
              <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Return to Surface</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default FaqSection;
