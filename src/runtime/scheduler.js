const queue = new Array();
let isFlushing = false;
let currentPromiseThen;
const resolvePromise = Promise.resolve();
export const nextTick = (fn) => {
  const p = currentPromiseThen || resolvePromise;
  return fn ? p.then(fn) : p;
};

export const queueJob = (job) => {
  if (!queue.length || !queue.includes(job)) {
    queue.push(job);
    queueFlush();
  }
};

const queueFlush = () => {
  if (!isFlushing) {
    currentPromiseThen = Promise.resolve().then(flushJob);
    isFlushing = true;
  }
};

const flushJob = () => {
  try {
    console.log("queue", queue);
    for (let i = 0; i < queue.length; i++) {
      const fn = queue[i];
      fn();
    }
  } finally {
    isFlushing = false;
    queue.length = 0;
  }
};
