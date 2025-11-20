type TickHandler = (seconds: number) => void;

export function createConnectionTimer(onTick: TickHandler) {
  let timerId: number | null = null;
  let startedAt: number | null = null;

  function start() {
    startedAt = Date.now();
    onTick(0);

    if (timerId !== null) {
      window.clearInterval(timerId);
    }

    timerId = window.setInterval(() => {
      if (startedAt === null) {
        return;
      }
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      onTick(elapsed);
    }, 1000);
  }

  function stop() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
    startedAt = null;
    onTick(0);
  }

  return {
    start,
    stop,
  };
}

