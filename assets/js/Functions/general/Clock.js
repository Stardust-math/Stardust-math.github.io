(function () {
  'use strict';

  let _timerId = null;

  function updateClock() {
    const now = new Date();
    const timeZoneName = now
      .toLocaleTimeString('en-us', { timeZoneName: 'short' })
      .split(' ')
      .pop();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${timeZoneName} ${hours}:${mins}`;

    const clock = document.getElementById('top-clock');
    if (clock) clock.textContent = timeString;
  }

  function start() {
    updateClock();

    // prevent double interval
    if (_timerId !== null) clearInterval(_timerId);
    _timerId = setInterval(updateClock, 1000);
  }

  window.Clock = {
    start,
    updateClock
  };
})();
