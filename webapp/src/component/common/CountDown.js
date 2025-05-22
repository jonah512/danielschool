import React, { useEffect, useState } from 'react';
import './countdown.css'
//  This componenet takes two props: initialSeconds onTimeout - Optional when the countdown reaches 0  
  const Countdown = ({ initialSeconds, onCompletion, Message }) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [timeToExpired] = useState(Math.floor(Date.now() / 1000) + initialSeconds);

    useEffect(() => {
      const interval = setInterval(() => {
        if (seconds > 0) {
          const leftTime = timeToExpired - Math.floor(Date.now() / 1000);
          setSeconds(leftTime);
        } else {
          clearInterval(interval);
          onCompletion(); // Call the completion handler when the countdown finishes
        }
      }, 1000);
  
      return () => clearInterval(interval); // Cleanup on unmount
    }, [seconds, onCompletion, timeToExpired]);
  
    return (
      <div className="countdown-container">
        <div className="countdown-heading">{Message}</div>
        {seconds} {/* Render the remaining seconds */}
      </div>
    );
  };

export default Countdown;