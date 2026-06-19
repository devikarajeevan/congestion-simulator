import "./HourlyTable.css";

const HOUR_LABELS = [
  "12am","1am","2am","3am","4am","5am",
  "6am","7am","8am","9am","10am","11am",
  "12pm","1pm","2pm","3pm","4pm","5pm",
  "6pm","7pm","8pm","9pm","10pm","11pm",
];

function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {status}
    </span>
  );
}

function FlipTag() {
  return <span className="flip-tag">↻ flipped</span>;
}

export default function HourlyTable({ hourlyResults, shiftedResults }) {
  const hasShift = shiftedResults.length > 0;

  return (
    <div className="table-wrapper">
      <table className="hourly-table">
        <thead>
          <tr>
            <th scope="col">Hour</th>
            <th scope="col">Volume</th>
            <th scope="col">Ratio</th>
            <th scope="col">Travel ×</th>
            <th scope="col">Toll</th>
            <th scope="col">Reward</th>
            <th scope="col">Status</th>
            {hasShift && (
              <>
                <th scope="col">New vol.</th>
                <th scope="col">New status</th>
                <th scope="col">Toll Δ</th>
                <th scope="col">Reward Δ</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {hourlyResults.map((h, i) => {
            const shifted = hasShift ? shiftedResults[i] : null;
            const flipped = shifted && shifted.status !== h.status;

            return (
              <tr
                key={i}
                className={flipped ? "row-flipped" : ""}
              >
                <td>{HOUR_LABELS[i]}</td>
                <td>{h.volume}</td>
                <td>{h.r.toFixed(2)}</td>
                <td>{h.t.toFixed(2)}×</td>
                <td className="cell-toll">
                  {h.toll > 0 ? `$${h.toll.toFixed(2)}` : "—"}
                </td>
                <td className="cell-reward">
                  {h.reward > 0 ? `$${h.reward.toFixed(2)}` : "—"}
                </td>
                <td>
                  <StatusBadge status={h.status} />
                </td>

                {hasShift && shifted && (
                  <>
                    <td className={shifted.volume !== h.volume ? "cell-changed" : ""}>
                      {shifted.volume}
                    </td>
                    <td>
                      <StatusBadge status={shifted.status} />
                      {flipped && <FlipTag />}
                    </td>
                    <td>
                      <DeltaCell
                        before={h.toll}
                        after={shifted.toll}
                        type="toll"
                      />
                    </td>
                    <td>
                      <DeltaCell
                        before={h.reward}
                        after={shifted.reward}
                        type="reward"
                      />
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DeltaCell({ before, after, type }) {
  const diff = after - before;
  if (Math.abs(diff) < 0.005) return <span className="cell-muted">—</span>;

  const sign = diff > 0 ? "+" : "";
  const isGood =
    (type === "toll" && diff < 0) ||
    (type === "reward" && diff > 0);

  return (
    <span className={isGood ? "delta-good" : "delta-bad"}>
      {sign}${Math.abs(diff).toFixed(2)}
    </span>
  );
}