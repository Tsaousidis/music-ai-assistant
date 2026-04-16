import { useEffect, useMemo, useState } from "react";

const messages = [
  "Analyzing vibe...",
  "Understanding your music taste...",
  "Finding similar tracks...",
  "Generating playlist..."
];

export default function Loader() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [typedText, setTypedText] = useState("");

  const currentMessage = useMemo(() => messages[messageIndex], [messageIndex]);

  useEffect(() => {
    setTypedText("");
    let charIndex = 0;

    const typingInterval = setInterval(() => {
      charIndex += 1;
      setTypedText(currentMessage.slice(0, charIndex));

      if (charIndex >= currentMessage.length) {
        clearInterval(typingInterval);
      }
    }, 55);

    return () => clearInterval(typingInterval);
  }, [currentMessage]);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3200);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="loader-shell">
      <div className="loader-card">
        <div className="wave">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <p className="loader-text">
          {typedText}
          <span className="loader-caret">|</span>
        </p>
      </div>
    </div>
  );
}