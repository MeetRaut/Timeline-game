import React, { useState, useEffect } from 'react';
import "./timeline.css";

function Timeline() {
  const [events, setEvents] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [usedIndices, setUsedIndices] = useState(new Set());
  const [message, setMessage] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);

  useEffect(() => {
    // Fetch the events from the JSON file
    fetch('/timeline.json')
      .then(response => response.json())
      .then(data => {
        setEvents(shuffle(data));
        initializeGame(data);
      })
      .catch(error => console.error('Error loading timeline data:', error));
  }, []);

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const initializeGame = (events) => {
    setMistakes(0);
    setCurrentStreak(0);
    setLongestStreak(0);
    setUsedIndices(new Set());
    setMessage('');

    const initialEvent = events[0];
    const initialCard = createCard(initialEvent);
    setTimeline([initialCard]);
    setCurrentCard(null);
    setUsedIndices(new Set([0]));
    loadNextCard(events, new Set([0]));
  };

  const createCard = (event) => (
    <div
      className="card"
      draggable="true"
      onDragStart={dragStart}
      onDragEnd={dragEnd}
      data-date={event.date}
    >
      <div className="name">{event.event}</div>
      <div className="image">
        <img src={event.image} alt="Event" className="unselectable" />
      </div>
      <div className="description">{event.description}</div>
      <div className="date" style={{ display: 'none' }}>{event.date}</div>
      <div className="back">
        <p className="information">{event.additional_info}</p>
        <div className="wikipedia">
          <a href={event.wikipedia_link} target="_blank" rel="noopener noreferrer">Wikipedia Link</a>
        </div>
      </div>
    </div>
  );

  const loadNextCard = (events, usedIndices) => {
    let nextEventIndex;
    do {
      nextEventIndex = Math.floor(Math.random() * events.length);
    } while (usedIndices.has(nextEventIndex) && usedIndices.size < events.length);

    if (usedIndices.size < events.length) {
      const nextEvent = events[nextEventIndex];
      const nextCard = createCard(nextEvent);
      setCurrentCard(nextCard);
      setUsedIndices(new Set([...usedIndices, nextEventIndex]));
    }
  };

  const dragStart = (e) => {
    e.dataTransfer.setData('text/plain', e.target.dataset.date);
    e.target.classList.add('dragging');
  };

  const dragEnd = (e) => {
    e.target.classList.remove('dragging');
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const date = e.dataTransfer.getData('text/plain');
    const card = currentCard;

    const newTimeline = [...timeline];
    newTimeline.splice(index, 0, card);

    if (checkOrder(newTimeline)) {
      setTimeline(newTimeline);
      setCurrentCard(null);
      setCurrentStreak(currentStreak + 1);
      setLongestStreak(Math.max(currentStreak + 1, longestStreak));

      // Show the year of the event in the dropped card
      const droppedCard = document.querySelector(`.card.dragging`);
      if (droppedCard) {
        droppedCard.querySelector('.date').style.display = 'block';
      }

      if (timeline.length === events.length - 1) {
        setMessage('Congratulations! You\'ve placed all cards correctly.');
        gameOver();
      } else {
        loadNextCard(events, usedIndices);
      }
    } else {
      setMistakes(mistakes + 1);
      gameOver();
    }
  };

  const checkOrder = () => {
  let isCorrectOrder = true;

  for (let i = 0; i < timeline.length - 1; i++) {
    const date1 = parseInt(timeline[i].props['data-date']);
    const date2 = parseInt(timeline[i + 1].props['data-date']);
    if (date1 > date2) {
      isCorrectOrder = false;
      break;
    }
  }

  if (isCorrectOrder) {
    const newStreak = currentStreak + 1;
    setCurrentStreak(newStreak);
    if (newStreak > longestStreak) {
      setLongestStreak(newStreak);
    }
    return true;
  } else {
    return false;
  }
};


  const gameOver = () => {
    setMessage(`Game Over! Longest streak: ${longestStreak}`);
  };

  const refreshPage = () => {
    initializeGame(events);
  };

  const allowDrop = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <div>Timeline</div>
      <div id="game-container">
        <div id="current-card-container">
          {currentCard}
        </div>
        <div id="timeline">
          {timeline.map((card, index) => (
            <div key={index} className="timeline-slot" onDrop={(e) => handleDrop(e, index)} onDragOver={allowDrop}>
              {card}
            </div>
          ))}
          <div className="timeline-slot empty-slot" onDrop={(e) => handleDrop(e, timeline.length)} onDragOver={allowDrop}></div>
        </div>
        <div id="play-again-button" onClick={refreshPage}>Play Again</div>
        <div id="message">{message}</div>
      </div>
    </>
  );
}

export default Timeline;