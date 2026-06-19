function round2(num) {
  return Math.round(num * 100) / 100;
}

function calcHour(volume, config) {
  const { capacity, baseRate, underThreshold } = config;

  const r = volume / capacity;
  const t = 1 + 0.15 * Math.pow(r, 4);
  const toll = r > 1 ? baseRate * (r - 1) : 0;
  const reward = r < underThreshold ? baseRate * (underThreshold - r) : 0;
  const status = r > 1 ? "toll" : r < underThreshold ? "reward" : "neutral";

  return {
    r: round2(r),
    t: round2(t),
    toll: round2(toll),
    reward: round2(reward),
    status
  };
}

function calcAllHours(volumes, config) {
  return volumes.map((volume, index) => {
    const result = calcHour(volume, config);
    return {
      hour: index,
      volume,
      ...result
    };
  });
}

function calcSummary(hourlyResults) {
  const totalToll = hourlyResults.reduce((sum, h) => sum + h.toll, 0);
  const totalReward = hourlyResults.reduce((sum, h) => sum + h.reward, 0);

  const peakHour = hourlyResults.reduce((max, h) =>
    h.r > max.r ? h : max
  );

  const bestRewardHour = hourlyResults.reduce((max, h) =>
    h.reward > max.reward ? h : max
  );

  return {
    totalToll: round2(totalToll),
    totalReward: round2(totalReward),
    peakHour: peakHour.hour,
    bestRewardHour: bestRewardHour.hour
  };
}

function calcShift(volumes, config, shiftPercent) {
  const peakIdx = volumes.reduce((maxIdx, v, i, arr) =>
    v > arr[maxIdx] ? i : maxIdx, 0
  );

  const quietIdx = volumes.reduce((minIdx, v, i, arr) =>
    v < arr[minIdx] ? i : minIdx, 0
  );

  const moveCount = Math.round(volumes[peakIdx] * shiftPercent / 100);

  const shiftedVolumes = [...volumes];
  shiftedVolumes[peakIdx] -= moveCount;
  shiftedVolumes[quietIdx] += moveCount;

  const shiftedResults = calcAllHours(shiftedVolumes, config);

  return {
    peakHour: peakIdx,
    quietHour: quietIdx,
    vehiclesMoved: moveCount,
    shiftedVolumes,
    hourlyResults: shiftedResults
  };
}

module.exports = { calcHour, calcAllHours, calcSummary, calcShift };