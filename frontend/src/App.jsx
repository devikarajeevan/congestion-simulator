import { useState, useEffect } from "react";
import ConfigPanel from "./components/ConfigPanel";
import VolumeEditor from "./components/VolumeEditor";
import VolumeChart from "./components/VolumeChart";
import SummaryCards from "./components/SummaryCards";
import HourlyTable from "./components/HourlyTable";
import ComparisonPanel from "./components/ComparisonPanel";
import "./App.css";

const API = "http://localhost:3001";

export default function App() {

  // --- STATE ---

  const [corridor, setCorridor] = useState("");
  const [config, setConfig] = useState(null);
  const [volumes, setVolumes] = useState([]);

  const [hourlyResults, setHourlyResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [shiftResult, setShiftResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seedLoading, setSeedLoading] = useState(true);
  const [seedError, setSeedError] = useState(null);

  // --- LOAD SEED DATA ON MOUNT ---

  useEffect(() => {
    async function loadSeed() {
      try {
        const res = await fetch(`${API}/seed`);
        if (!res.ok) throw new Error("Failed to load seed data");
        const data = await res.json();
        setCorridor(data.corridor);
        setConfig(data.config);
        setVolumes(data.volumes);
      } catch (err) {
        setSeedError("Could not connect to the server. Make sure the backend is running.");
      } finally {
        setSeedLoading(false);
      }
    }
    loadSeed();
  }, []);

  // --- CALCULATE HANDLER ---

  async function handleCalculate() {
    setLoading(true);
    setError(null);
    try {
      const [simRes, sumRes] = await Promise.all([
        fetch(`${API}/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ volumes, config }),
        }),
        fetch(`${API}/summary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ volumes, config }),
        }),
      ]);

      if (!simRes.ok) {
        const err = await simRes.json();
        throw new Error(err.errors?.join(", ") || "Simulation failed");
      }
      if (!sumRes.ok) {
        const err = await sumRes.json();
        throw new Error(err.errors?.join(", ") || "Summary failed");
      }

      const simData = await simRes.json();
      const sumData = await sumRes.json();

      setHourlyResults(simData.hourlyResults);
      setSummary(sumData.summary);
      setShiftResult(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- SHIFT HANDLER ---

  async function handleShift(shiftPercent) {
    try {
      const res = await fetch(`${API}/shift`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volumes, config, shiftPercent }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.errors?.join(", ") || "Shift failed");
      }

      const data = await res.json();
      setShiftResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  // --- VOLUME CHANGE HANDLER ---

  function handleVolumeChange(index, value) {
    const updated = [...volumes];
    updated[index] = value;
    setVolumes(updated);
  }

  // --- RENDER ---

  if (seedLoading) {
    return (
      <div className="app-loading">
        <p>Loading corridor data…</p>
      </div>
    );
  }

  if (seedError) {
    return (
      <div className="app-error">
        <p>{seedError}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Congestion Reward Simulator</h1>
        <p className="app-subtitle">{corridor}</p>
      </header>

      <main className="app-main">
        <section className="card" aria-labelledby="config-heading">
          <h2 id="config-heading">Configuration</h2>
          <ConfigPanel
            config={config}
            onChange={setConfig}
          />
        </section>

        <section className="card" aria-labelledby="volumes-heading">
          <h2 id="volumes-heading">Hourly Volumes</h2>
          <VolumeEditor
            volumes={volumes}
            onChange={handleVolumeChange}
          />
          {error && <p className="error-message" role="alert">{error}</p>}
          <div className="calculate-row">
            <button
              onClick={handleCalculate}
              disabled={loading}
            >
              {loading ? "Calculating…" : "Calculate"}
            </button>
          </div>
        </section>

        {hourlyResults.length > 0 && (
          <>
            <section className="card" aria-labelledby="chart-heading">
              <h2 id="chart-heading">Volume by Hour</h2>
              <VolumeChart
                volumes={volumes}
                capacity={config.capacity}
                underThreshold={config.underThreshold}
              />
            </section>

            <section className="card" aria-labelledby="results-heading">
              <h2 id="results-heading">Results</h2>
              {summary && <SummaryCards summary={summary} />}
              <HourlyTable
                hourlyResults={hourlyResults}
                shiftedResults={shiftResult?.shifted?.hourlyResults || []}
              />
            </section>

            <section className="card" aria-labelledby="comparison-heading">
              <h2 id="comparison-heading">What-if: Shift Peak Traffic</h2>
              <ComparisonPanel
                volumes={volumes}
                config={config}
                shiftResult={shiftResult}
                onShift={handleShift}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}