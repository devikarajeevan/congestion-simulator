import "./SummaryCards.css";

const HOUR_LABELS = [
  "12am","1am","2am","3am","4am","5am",
  "6am","7am","8am","9am","10am","11am",
  "12pm","1pm","2pm","3pm","4pm","5pm",
  "6pm","7pm","8pm","9pm","10pm","11pm",
];

export default function SummaryCards({ summary }) {
  const { totalToll, totalReward, peakHour, bestRewardHour } = summary;

  const cards = [
    {
      label: "Total toll collected",
      value: `$${totalToll.toFixed(2)}`,
      modifier: "card-toll",
    },
    {
      label: "Total reward paid",
      value: `$${totalReward.toFixed(2)}`,
      modifier: "card-reward",
    },
    {
      label: "Peak hour",
      value: HOUR_LABELS[peakHour],
      modifier: "",
    },
    {
      label: "Best reward hour",
      value: HOUR_LABELS[bestRewardHour],
      modifier: "",
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card) => (
        <div key={card.label} className={`summary-card ${card.modifier}`}>
          <span className="summary-card-label">{card.label}</span>
          <span className="summary-card-value">{card.value}</span>
        </div>
      ))}
    </div>
  );
}