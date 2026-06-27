"use client";

import React, {useEffect, useState} from 'react';
import Home from "./components/home";
import Test from "./components/test";

export default function Tabs() {
  const tabs = [
    { id: "home", label: "Home", content: <Home />},
    { id: "test", label: "Test", content: <Test />},
    { id: "ing", label: "testing", content: "Heck Content"}
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div class="bg-gray-400 min-h-screen flex flex-col">
      {/* Header */}
      <div class="mx-auto flex justify-center items-center bg-blue-500 h-16 w-full mb-2 gap-4">
        <img src='/images/njdot_img.png' class="h-14 w-auto" />
        <h1 class="text-4xl text-white font-bold">NJDOT Data Collection</h1>
      </div>

      {/* Body */}
      <div class="flex flex-1 mb-2">
        {/* Tabs */}
        <div class="items-start flex flex-col gap-x-10 bg-gray-100">
          {tabs.map((tab) => (
            <button class=
            {
              `text-black border-2 text-center w-32 h-12 
              ${activeTab === tab.id ? "bg-blue-200 bold hover:bg-blue-300" : "bg-white hover:bg-gray-300"}`
            }
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              style={{
                fontWeight: activeTab === tab.id ? "bold" : "normal",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div class="bg-white w-full ml-2 mr-2">
          {tabs.find(t => t.id === activeTab)?.content}
        </div>
      </div>
    </div>
  );
}
