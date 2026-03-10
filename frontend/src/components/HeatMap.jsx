import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const tooltip =
  "Shows city-level opportunity scores across South India. Judges: click Chennai to see top 3 in-demand jobs, colour-coded by opportunity level.";

export default function HeatMap({ apiBase }) {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    axios
      .get(`${apiBase}/heatmap-data`)
      .then((res) => setCities(res.data.cities || []))
      .catch(() => setCities([]));
  }, [apiBase]);

  const center = [12.5, 78.5];

  const getColor = (score) => {
    if (score > 0.7) return "#22c55e";
    if (score >= 0.4) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="glass-panel p-4 md:p-6 h-[480px] md:h-[560px] flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-accent-cyan">Opportunity Heatmap</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
              Tamil Nadu & neighbours
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Circle size & colour show relative opportunity for green & essential jobs across
            nearby cities.
          </p>
        </div>
        <button
          className="text-xs text-slate-400 border border-slate-700 rounded-full px-3 py-1 hover:border-accent-cyan hover:text-accent-cyan"
          title={tooltip}
        >
          How it works?
        </button>
      </div>
      <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800">
        <MapContainer
          center={center}
          zoom={6.2}
          style={{ height: "100%", width: "100%" }}
          className="leaflet-container"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {cities.map((city) => (
            <CircleMarker
              key={city.name}
              center={[city.lat, city.lng]}
              radius={18 * city.opportunity_score}
              pathOptions={{
                color: getColor(city.opportunity_score),
                fillColor: getColor(city.opportunity_score),
                fillOpacity: 0.5
              }}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-semibold mb-1">{city.name}</div>
                  <div className="mb-1">
                    Opportunity score:{" "}
                    <span className="font-medium">
                      {Math.round(city.opportunity_score * 100)}
                      %
                    </span>
                  </div>
                  <div className="text-slate-500 mb-1">Top in-demand roles:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {city.top_jobs.map((j) => (
                      <li key={j}>{j}</li>
                    ))}
                  </ul>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

