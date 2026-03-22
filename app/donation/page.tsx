"use client";

import { useState } from "react";
import ngos from "@/data/ngos.json";

type NGO = {
  name: string;
  city: string;
  focus: string;
  website: string;
  verified: boolean;
};

export default function DonationPage() {
  const [search, setSearch] = useState("");
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);

  // 🔍 Filter NGOs
  const filteredNGOs = ngos.filter((ngo: NGO) =>
    ngo.name.toLowerCase().includes(search.toLowerCase()) ||
    ngo.city.toLowerCase().includes(search.toLowerCase()) ||
    ngo.focus.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-4">
          💖 Donate to Verified NGOs
        </h2>

        {/* 🔍 Search */}
        <input
          type="text"
          placeholder="Search NGO, city, or cause..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded-lg mb-3"
        />

        {/* 📋 NGO List */}
        <div className="max-h-48 overflow-y-auto border rounded-lg">
          {filteredNGOs.length > 0 ? (
            filteredNGOs.map((ngo: NGO) => (
              <div
                key={ngo.name}
                onClick={() => setSelectedNGO(ngo)}
                className="p-2 cursor-pointer hover:bg-purple-100"
              >
                <p className="font-medium">
                  {ngo.name} {ngo.verified && "✅"}
                </p>
                <p className="text-xs text-gray-500">
                  {ngo.city} • {ngo.focus}
                </p>
              </div>
            ))
          ) : (
            <p className="p-2 text-gray-500 text-sm">No NGO found</p>
          )}
        </div>

        {/* ✅ Selected NGO */}
        {selectedNGO && (
          <div className="mt-4 text-center">
            <h3 className="font-semibold text-purple-700">
              {selectedNGO.name}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedNGO.city} • {selectedNGO.focus}
            </p>

            <a
              href={selectedNGO.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              🌐 Visit Official Website
            </a>

            <p className="text-xs text-gray-500 mt-2">
              🔒 Donations are processed on official NGO websites
            </p>
          </div>
        )}
      </div>
    </div>
  );
}