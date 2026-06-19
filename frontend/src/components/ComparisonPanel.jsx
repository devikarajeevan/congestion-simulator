import { useState, useEffect } from "react";
import "./ComparisonPanel.css";

const HOUR_LABELS = [
  "12am","1am","2am","3am","4am","5am",
  "6am","7am","8am","9am","10am","11am",
  "12pm","1pm","2pm","3pm","4pm","5pm",
  "6pm","7pm","8pm","9pm","10pm","11pm",
];

export default function ComparisonPanel({ shiftResult, onShift }) {
  const [shiftPercent, setShiftPercent] = useState(20);

  useEffect(() => {
    onShift(shiftPercent);
  }, []);

  function handleSliderChange(e) {
    const val = parseInt(e.target.value, 10);
    setShiftPercent(val);
    onShift(val);
  }

  return (
    <div className="comparison-panel">
      <div className="shift-control">
        <label htmlFor="shift-slider">
          Shift percentage — move this % of peak-hour volume to the
          quietest hour
        </label>
        <div className="slider-row">
          <input
            id="shift-slider"
            type="range"
            min="0"
            max="50"
            step="1"
            value={shiftPercent}
            onChange={handleSliderChange}
          />
          <span className="shift-value">{shiftPercent}%</span>
        </div>
      </div>

      {shiftResult && (
        <>
          <div className="shift-meta">
            <p>
              Moving{" "}
              <strong>{shiftResult.shifted.vehiclesMoved} vehicles</strong>{" "}
              from{" "}
              <strong>{HOUR_LABELS[shiftResult.shifted.peakHour]}</strong>{" "}
              (peak) to{" "}
              <strong>{HOUR_LABELS[shiftResult.shifted.quietHour]}</strong>{" "}
              (quietest)
            </p>
          </div>

          <div className="comparison-grid">
            <SummaryBlock
              title="Baseline"
              summary={shiftResult.baseline.summary}
              modifier=""
            />
            <SummaryBlock
              title={`After ${shiftPercent}% shift`}
              summary={shiftResult.shifted.summary}
              modifier="summary-shifted"
            />
          </div>
        </>
      )}
    </div>
  );
}

function SummaryBlock({ title, summary, modifier }) {
  const HOUR_LABELS = [
    "12am","1am","2am","3am","4am","5am",
    "6am","7am","8am","9am","10am","11am",
    "12pm","1pm","2pm","3pm","4pm","5pm",
    "6pm","7pm","8pm","9pm","10pm","11pm",
  ];

  return (
    <div className={`summary-block ${modifier}`}>
      <h3 className="summary-block-title">{title}</h3>
      <dl className="summary-block-list">
        <div className="summary-block-row">
          <dt>Total toll</dt>
          <dd className="value-toll">${summary.totalToll.toFixed(2)}</dd>
        </div>
        <div className="summary-block-row">
          <dt>Total reward</dt>
          <dd className="value-reward">${summary.totalReward.toFixed(2)}</dd>
        </div>
        <div className="summary-block-row">
          <dt>Peak hour</dt>
          <dd>{HOUR_LABELS[summary.peakHour]}</dd>
        </div>
        <div className="summary-block-row">
          <dt>Best reward hour</dt>
          <dd>{HOUR_LABELS[summary.bestRewardHour]}</dd>
        </div>
      </dl>
    </div>
  );
}