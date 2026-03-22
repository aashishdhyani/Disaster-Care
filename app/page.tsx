"use client";

import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
});

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl text-center">Disaster Dashboard</h1>
      <LiveMap />
    </div>
  );
}