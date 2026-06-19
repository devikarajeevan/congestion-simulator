import "./VolumeEditor.css";

const HOUR_LABELS = [
  "12am", "1am", "2am", "3am", "4am", "5am",
  "6am", "7am", "8am", "9am", "10am", "11am",
  "12pm", "1pm", "2pm", "3pm", "4pm", "5pm",
  "6pm", "7pm", "8pm", "9pm", "10pm", "11pm",
];

export default function VolumeEditor({ volumes, onChange }) {
  function handleChange(index, raw) {
    const parsed = parseInt(raw, 10);
    onChange(index, isNaN(parsed) ? 0 : parsed);
  }

  return (
    <div className="volume-editor">
      {volumes.map((volume, index) => (
        <div key={index} className="volume-field">
          <label htmlFor={`vol-${index}`}>{HOUR_LABELS[index]}</label>
          <input
            id={`vol-${index}`}
            type="number"
            min="0"
            value={volume}
            onChange={(e) => handleChange(index, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}