import React, { useState, useEffect } from 'react';

interface ScreenReaderAnnouncerProps {
  message: string;
}

const ScreenReaderAnnouncer: React.FC<ScreenReaderAnnouncerProps> = ({ message }) => {
  const [announceMessage, setAnnounceMessage] = useState('');

  // By changing the key of the div, we ensure that screen readers
  // re-announce the message even if it's the same as the previous one.
  // However, a simpler approach for distinct messages is just to update the content.
  // If messages might be identical consecutively and still need announcement,
  // a toggling key or a brief intermediary message might be needed.
  // For now, we assume messages will be distinct enough or that changing content is sufficient.

  useEffect(() => {
    // Set the message, then clear it shortly after to allow for re-announcement of the same message if needed,
    // though this strategy is more for "polite" announcements that might be missed.
    // For assertive, it's usually enough that the content changes.
    if (message) {
      setAnnounceMessage(message);
      // Optional: Clear after a short delay if needed for specific screen reader behaviors
      // const timer = setTimeout(() => setAnnounceMessage(''), 100);
      // return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      role="status"
      aria-live="assertive" // "assertive" for important updates like slide changes
      aria-atomic="true"
      className="sr-announcer" // Visually hidden class defined in preview.css
    >
      {announceMessage}
    </div>
  );
};

export default ScreenReaderAnnouncer;
