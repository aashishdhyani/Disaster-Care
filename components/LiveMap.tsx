"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔥 Fix Leaflet icons INSIDE useEffect (NOT top level)
const useFixLeafletIcons = () => {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    });
  }, []);
};

// 🔥 Dynamic import (CRITICAL)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// 🔥 Icons
const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
  iconSize: [25, 25],
});

const policeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
  iconSize: [25, 25],
});

const shelterIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946436.png",
  iconSize: [25, 25],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [25, 25],
});

const LiveMap: React.FC = () => {
  useFixLeafletIcons();

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // 📍 Location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(coords);
        fetchPlaces(coords);
      },
      () => {
        const fallback: [number, number] = [28.6139, 77.2090];
        setPosition(fallback);
        fetchPlaces(fallback);
      }
    );
  }, []);

  // 🌍 Fetch
  const fetchPlaces = async ([lat, lon]: [number, number]) => {
    setLoading(true);

    const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:8000,${lat},${lon});
      node["amenity"="police"](around:8000,${lat},${lon});
      node["office"="government"](around:8000,${lat},${lon});
      node["amenity"="shelter"](around:8000,${lat},${lon});
      node["social_facility"="shelter"](around:8000,${lat},${lon});
      node["amenity"="community_centre"](around:8000,${lat},${lon});
    );
    out;
    `;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    const data = await res.json();
    setPlaces(data.elements);
    setLoading(false);
  };

  // 🧠 Type
  const getType = (tags: any) => {
    if (tags?.amenity === "hospital") return "hospital";
    if (tags?.amenity === "police" || tags?.office === "government")
      return "police";
    if (
      tags?.amenity === "shelter" ||
      tags?.social_facility === "shelter" ||
      tags?.amenity === "community_centre"
    )
      return "shelter";
    return "other";
  };

  const getIcon = (tags: any) => {
    const type = getType(tags);
    if (type === "hospital") return hospitalIcon;
    if (type === "police") return policeIcon;
    if (type === "shelter") return shelterIcon;
    return userIcon;
  };

  // 📏 Distance
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredPlaces =
    position &&
    places
      .filter((p) => (filter === "all" ? true : getType(p.tags) === filter))
      .sort((a, b) => {
        const d1 = getDistance(position[0], position[1], a.lat, a.lon);
        const d2 = getDistance(position[0], position[1], b.lat, b.lon);
        return d1 - d2;
      });

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("hospital")}>Hospitals</button>
        <button onClick={() => setFilter("police")}>Police</button>
        <button onClick={() => setFilter("shelter")}>Shelters</button>
      </div>

      {loading && <p>Loading...</p>}

      {position && (
        <div className="h-[400px]">
          <MapContainer center={position} zoom={13} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <Marker position={position} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>

            {filteredPlaces?.map((place, i) => (
              <Marker
                key={i}
                position={[place.lat, place.lon]}
                icon={getIcon(place.tags)}
              >
            <Popup>
  <div className="min-w-[180px]">
    <h3 className="font-bold text-lg text-purple-700">
      {place.tags?.name || "Unknown Location"}
    </h3>

    <p className="text-sm text-gray-600">
      Type: {getType(place.tags)}
    </p>

    <p className="text-sm">
      Distance:{" "}
      {getDistance(
        position[0],
        position[1],
        place.lat,
        place.lon
      ).toFixed(2)} km
    </p>

    {/* ✅ NAVIGATION BUTTON */}
    <a
      href={`https://www.google.com/maps/dir/?api=1&origin=${position[0]},${position[1]}&destination=${place.lat},${place.lon}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-3 text-center bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition"
    >
      🧭 Navigate Now
    </a>

    {/* ✅ OPTIONAL CALL BUTTON */}
    {place.tags?.phone && (
      <a
        href={`tel:${place.tags.phone}`}
        className="block mt-2 text-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        📞 Call
      </a>
    )}
  </div>
</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default LiveMap;