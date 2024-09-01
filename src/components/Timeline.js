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
    <div className="card" draggable="true" onDragStart={dragStart} onDragEnd={dragEnd} data-date={event.date}>
      <div className="name">{event.event}</div>
      <div className="image">
        <img src={event.image} alt="Event" className="unselectable" />
      </div>
      <div className="description">{event.description}</div>
      <div className="date" style={{ display: 'block' }}>{event.date}</div>
      <div className="back">
        <p className="information">{event.additional_info}</p>
        <div className="wikipedia">
          <a href="https://github.com/Myst-Blazeio/Historia-Game.github.io" target="_blank" rel="noopener noreferrer">Wikipedia Link</a>
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

  const handleDrop = (e) => {
    e.preventDefault();
    const date = e.dataTransfer.getData('text/plain');
    const card = timeline.find(card => card.props.children[3].props.children === date); // Correctly find the card by its date

    if (checkOrder([...timeline, card])) {
      setTimeline([...timeline, card]);
      setCurrentCard(null);
      setCurrentStreak(currentStreak + 1);
      setLongestStreak(Math.max(currentStreak + 1, longestStreak));
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

  const checkOrder = (timeline) => {
    for (let i = 0; i < timeline.length - 1; i++) {
      const date1 = parseInt(timeline[i].props.date);
      const date2 = parseInt(timeline[i + 1].props.date);
      if (date1 > date2) {
        return false;
      }
    }
    return true;
  };

  const gameOver = () => {
    setMessage(`Game Over! Longest streak: ${longestStreak}`);
    // Reset the game or provide option to restart
  };

  const refreshPage = () => {
    initializeGame(events);
  };

  return (
    <>
      <div>Timeline</div>
      <div id="game-container">
        <div id="current-card-container">
          {currentCard}
        </div>
        <div className="temp" style={{ display: 'flex' }}>
          <button id="next-card-button" disabled>Load Next Card</button>
          <div className="game-rules-container">
            <button id="game-rules-button" onClick={() => alert('Game Rules: Place cards in chronological order!')}>Game Rules</button>
          </div>
        </div>
        <div id="timeline">
          {timeline}
        </div>
        <div id="play-again-button" onClick={refreshPage}>Play Again</div>
        <div id="message">{message}</div>
      </div>
    </>
  );
}

export default Timeline;