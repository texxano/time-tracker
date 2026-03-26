import React, { useState, useEffect } from 'react';

const TotalWorkTimeTrack = ({ startDate, stopDate }) => {
    const calculateTimeDifference = (startDate, stopDate) => {
      let distance = new Date(stopDate).getTime() - new Date(startDate).getTime();
      // Handle negative/invalid duration (stop before start) by treating as 0
      if (distance < 0) {
        distance = 0;
      }
      let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
      return { days, hours, minutes, seconds };
    };

    const [time, setTime] = useState(calculateTimeDifference(startDate, stopDate?stopDate : new Date() ));
  
    useEffect(() => {
      const interval = setInterval(() => {
        setTime(calculateTimeDifference(startDate, stopDate?stopDate : new Date()));
      }, 1000);
  
      return () => clearInterval(interval);
    }, [startDate, stopDate]);
   
    return (
      <>
        {time.days && time.days >= 0 ? <>{time.days}d </> : <> </>}
        {time.hours && time.hours >= 0 ? <>{String(time.hours).padStart(2, '0')}:</> : <>00:</>}
        {time.minutes && time.minutes >= 0 ? <>{String(time.minutes).padStart(2, '0')}:</> : <>00:</>}
        {time.seconds && time.seconds >= 0 ? <>{String(time.seconds).padStart(2, '0')} </> : <>00</>}
      </>
    );
  };
  
  export default TotalWorkTimeTrack;
