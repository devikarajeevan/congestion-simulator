import "./ConfigPanel.css";

export default function ConfigPanel({ config, onChange }) {
  function handleChange(field, value) {
    const parsed = parseFloat(value);
    onChange({
      ...config,
      [field]: isNaN(parsed) ? value : parsed,
    });
  }
  // console.log(onChange)
  console.log("ConfigPanel rendered with config:", config);
  return (
    <div className="config-panel">
      <div className="config-field">
        <label htmlFor="capacity">Capacity (vehicles/hour)</label>
        <input
          id="capacity"
          type="number"
          min="1"
          value={config.capacity}
          onChange={(e) => handleChange("capacity", e.target.value)}
        />
      </div>

      <div className="config-field">
        <label htmlFor="baseRate">Base Rate ($)</label>
        <input
          id="baseRate"
          type="number"
          min="0.01"
          step="0.01"
          value={config.baseRate}
          onChange={(e) => handleChange("baseRate", e.target.value)}
        />
      </div>

      <div className="config-field">
        <label htmlFor="underThreshold">
          Under Threshold (0–1)
        </label>
        <input
          id="underThreshold"
          type="number"
          min="0.01"
          max="0.99"
          step="0.01"
          value={config.underThreshold}
          onChange={(e) => handleChange("underThreshold", e.target.value)}
        />
        <span className="config-hint">
          Reward applies when congestion ratio is below this value
        </span>
      </div>
    </div>
  );
}