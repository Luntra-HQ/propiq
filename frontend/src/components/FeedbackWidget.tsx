import { useState, useEffect } from 'react';
import './FeedbackWidget.css';

interface FeedbackWidgetProps {
  /**
   * Your Tally form ID (e.g., "wMeDqP" from your Tally form URL)
   * Get this from: https://tally.so/forms/YOUR_FORM_ID
   */
  tallyFormId: string;

  /**
   * Hidden fields to pre-populate in the form
   * e.g., { user_tier: 'Pro', user_email: 'user@example.com' }
   */
  hiddenFields?: Record<string, string>;

  /**
   * Button position (default: 'bottom-right')
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * FeedbackWidget - Tally.so form integration for PropIQ
 *
 * Usage:
 * <FeedbackWidget
 *   tallyFormId="wMeDqP"
 *   hiddenFields={{ user_tier: 'Pro', user_id: '123' }}
 * />
 */
export const FeedbackWidget = ({
  tallyFormId,
  hiddenFields = {},
  position = 'bottom-right'
}: FeedbackWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Load Tally embed script
  useEffect(() => {
    // Check if script already loaded
    if (document.getElementById('tally-js')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'tally-js';
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.getElementById('tally-js');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Open Tally popup
  const openFeedbackForm = () => {
    // @ts-ignore - Tally is loaded via external script
    if (window.Tally) {
      // Build hidden fields query string
      const hiddenFieldsQuery = Object.entries(hiddenFields)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const formUrl = hiddenFieldsQuery
        ? `https://tally.so/r/${tallyFormId}?${hiddenFieldsQuery}`
        : `https://tally.so/r/${tallyFormId}`;

      // @ts-ignore
      window.Tally.openPopup(tallyFormId, {
        layout: 'modal',
        width: 600,
        autoClose: 3000, // Auto-close after 3s on submission
        hiddenFields: hiddenFields,
        onSubmit: () => {
          console.log('Feedback submitted successfully');
          setIsOpen(false);
        }
      });
    } else {
      console.error('Tally script not loaded');
      // Fallback: open in new tab
      window.open(`https://tally.so/r/${tallyFormId}`, '_blank');
    }
  };

  return (
    <button
      className={`feedback-widget-button ${position}`}
      onClick={openFeedbackForm}
      aria-label="Give feedback"
    >
      <FeedbackIcon />
      <span>Give Feedback</span>
    </button>
  );
};

/**
 * FeedbackWidgetInline - Embed Tally form directly in a page
 *
 * Usage:
 * <FeedbackWidgetInline
 *   tallyFormId="wMeDqP"
 *   height="500px"
 * />
 */
interface FeedbackWidgetInlineProps {
  tallyFormId: string;
  hiddenFields?: Record<string, string>;
  height?: string;
}

export const FeedbackWidgetInline = ({
  tallyFormId,
  hiddenFields = {},
  height = '500px'
}: FeedbackWidgetInlineProps) => {

  // Build hidden fields query string
  const hiddenFieldsQuery = Object.entries(hiddenFields)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const embedUrl = hiddenFieldsQuery
    ? `https://tally.so/embed/${tallyFormId}?alignLeft=1&hideTitle=1&transparentBackground=1&${hiddenFieldsQuery}`
    : `https://tally.so/embed/${tallyFormId}?alignLeft=1&hideTitle=1&transparentBackground=1`;

  return (
    <div className="feedback-widget-inline">
      <iframe
        data-tally-src={embedUrl}
        width="100%"
        height={height}
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="Feedback Form"
        style={{ border: 'none' }}
      ></iframe>

      {/* Load Tally embed script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (!document.getElementById('tally-js')) {
              var d = document, w = "https://tally.so/widgets/embed.js", v = function() {
                if (typeof Tally !== "undefined") {
                  Tally.loadEmbeds();
                } else {
                  d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach(function(e) {
                    e.src = e.dataset.tallySrc;
                  });
                }
              };
              if (typeof Tally !== "undefined") {
                v();
              } else if (d.querySelector('script[src="' + w + '"]') === null) {
                var s = d.createElement("script");
                s.id = "tally-js";
                s.src = w;
                s.onload = v;
                s.onerror = v;
                d.body.appendChild(s);
              }
            }
          `
        }}
      />
    </div>
  );
};

const FeedbackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    <line x1="9" y1="10" x2="15" y2="10"></line>
    <line x1="12" y1="7" x2="12" y2="13"></line>
  </svg>
);
