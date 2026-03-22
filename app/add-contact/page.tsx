"use client";

import { useState, useEffect } from "react";

export default function AddContact() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let id = localStorage.getItem("userId");

    if (!id) {
      id = "user123"; // 🔥 SAME ID
      localStorage.setItem("userId", id);
    }

    setUserId(id);
  }, []);

  const addContact = async () => {
    if (!name || !phone || !email) {
      alert("Fill all fields");
      return;
    }

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        name,
        phone,
        email,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("✅ Contact Added");
      setName("");
      setPhone("");
      setEmail("");
    } else {
      alert("❌ Failed");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-20">
      <input
        placeholder="Name"
        className="border p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Phone"
        className="border p-2"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        placeholder="Email"
        className="border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        onClick={addContact}
        className="bg-blue-600 text-white px-5 py-2"
      >
        Add Contact
      </button>
    </div>
  );
}