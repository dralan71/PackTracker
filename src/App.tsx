import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  PiAirplane,
  PiCloudArrowUp,
  PiCloudArrowDown,
  PiPlus,
  PiSuitcase,
  PiTrash,
} from "react-icons/pi";
import { type Baggage, type BaggageType, type Item } from "./types";
import BaggageCard from "./components/BaggageCard";
import { DEFAULT_ITEMS } from "./data/defaultItems";
import Papa from "papaparse";
import "./App.css";

const STORAGE_KEY = "luggage-tracker-data";
const SESSION_STORAGE_KEY = "luggage-tracker-session-data";

function isValidBaggageArray(data: unknown): data is Baggage[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (bag) =>
      typeof bag.id === "string" &&
      typeof bag.type === "string" &&
      typeof bag.nickname === "string" &&
      Array.isArray(bag.items) &&
      bag.items.every(
        (item: Item) =>
          typeof item.id === "string" &&
          typeof item.name === "string" &&
          typeof item.icon === "string" &&
          typeof item.quantity === "number" &&
          typeof item.packed === "boolean"
      )
  );
}

function App() {
  const [baggages, setBaggages] = useState<Baggage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [collapsedMap, setCollapsedMap] = useState<{ [id: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAnyCollapsed = useMemo(
    () => Object.values(collapsedMap).some((v) => v),
    [collapsedMap]
  );

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        if (isValidBaggageArray(parsedData)) {
          setBaggages(parsedData);
        } else {
          console.warn("Invalid baggage data found in localStorage. Ignoring.");
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Load collapsed state from sessionStorage
  useEffect(() => {
    const storedCollapsed = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedCollapsed) {
      try {
        const parsedCollapsed = JSON.parse(storedCollapsed);
        if (typeof parsedCollapsed === "object") {
          setCollapsedMap(parsedCollapsed);
        } else {
          console.warn("Invalid collapsed state found in sessionStorage. Ignoring.");
        }
      } catch (error) {
        console.error("Failed to load collapsed state from sessionStorage:", error);
      }
    }
  }, []);

  // Save data to localStorage when baggages change (but not on first render)
  useEffect(() => {
    //? consider adding a save button and alert when trying to leave without saving
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(baggages));
      } catch (error) {
        console.error("Failed to save data to localStorage:", error);
      }
    }
  }, [baggages, isLoaded]);

  // Save collapsed state to sessionStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(collapsedMap));
      } catch (error) {
        console.error("Failed to save collapsed state to sessionStorage:", error);
      }
    }
  }, [collapsedMap, isLoaded]);

  const addBaggage = (type: BaggageType) => {
    const newBaggage: Baggage = {
      id: Date.now().toString(),
      type,
      nickname: "",
      items: [],
    };
    setBaggages([...baggages, newBaggage]);
    setCollapsedMap((prev) => ({ ...prev, [newBaggage.id]: false }));
  };

  const updateBaggage = (updatedBaggage: Baggage) => {
    setBaggages(
      baggages.map((bag) =>
        bag.id === updatedBaggage.id ? updatedBaggage : bag
      )
    );
  };

  const deleteBaggage = (id: string) => {
    const _baggage = baggages.find((bag) => bag.id === id);
    if (
      _baggage?.items.length === 0 ||
      window.confirm(
        `Are you sure you want to delete ${
          _baggage?.nickname ? _baggage.nickname : "this baggage"
        }? This action cannot be undone.`
      )
    ) {
      setBaggages(baggages.filter((bag) => bag.id !== id));
      setCollapsedMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all luggage data? This action cannot be undone."
      )
    ) {
      setBaggages([]);
      setCollapsedMap({});
      localStorage.removeItem(STORAGE_KEY);
    }
  };
  // Collapse/Expand all handlers
  const setAllCollapsed = (collapsed: boolean) => {
    const newMap: { [id: string]: boolean } = {};
    baggages.forEach((bag) => {
      newMap[bag.id] = collapsed;
    });
    setCollapsedMap(newMap);
  };

  const exportToCSV = () => {
    interface CSVRow {
      baggageId: string;
      itemIcon: string;
      baggageType: string;
      baggageNickname: string;
      itemName: string;
      quantity: number;
      packed: boolean;
    }
    
    const csvData: CSVRow[] = [];

    baggages.forEach((baggage) => {
      baggage.items.forEach((item) => {
        csvData.push({
          baggageId: baggage.id,
          itemIcon: item.icon,
          baggageType: baggage.type,
          baggageNickname: baggage.nickname,
          itemName: item.name,
          quantity: item.quantity,
          packed: item.packed,
        });
      });
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `luggage-tracker.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url); // Clean up the object URL after use
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => { 
    //Todo - check for data validity and report back to user
    //Todo - eg. try{...}catch{alert("Invalid CSV format")}
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        interface CSVRow {
          baggageId?: string;
          itemIcon?: string;
          baggageType?: string;
          baggageNickname?: string;
          itemName?: string;
          quantity?: string;
          packed?: string;
        }
        
        const importedBaggages: { [key: string]: Baggage } = {};

        (results.data as CSVRow[]).forEach((row) => {
          if (!row.baggageId) return;

          if (!importedBaggages[row.baggageId]) {
            importedBaggages[row.baggageId] = {
              id: row.baggageId,
              type: (row.baggageType as BaggageType) || "other",
              nickname: row.baggageNickname || "",
              items: [],
            };
          }

          if (row.itemName) {
            importedBaggages[row.baggageId].items.push({
              id: Date.now().toString() + Math.random(),
              name: row.itemName,
              icon: row.itemIcon || "cube",
              quantity: parseInt(row.quantity || "1") || 1,
              packed: row.packed === "true",
            });
          }
        });

        setBaggages(Object.values(importedBaggages));
      },
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const baggageTypes: BaggageType[] = [
    "carry-on",
    "medium-checked",
    "large-checked",
    "backpack",
    "other",
  ];

  // Show loading indicator while data is being loaded
  if (!isLoaded) {
    return (
      <div className="App">
        <header className="app-header">
          <h1>
            <PiAirplane />
            PackTracker
          </h1>
        </header>
        <div className="loading-state">
          <PiSuitcase />
          <p>Loading your luggage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>
          <PiAirplane />
          PackTracker
        </h1>

        <div className="header-actions">
          <input
            type="file"
            accept=".csv"
            onChange={importFromCSV}
            ref={fileInputRef}
            style={{ display: "none" }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="import-btn"
          >
            <PiCloudArrowUp />
            Import CSV
          </button>

          <button
            onClick={exportToCSV}
            className="export-btn"
            disabled={baggages.length === 0}
          >
            <PiCloudArrowDown />
            Export CSV
          </button>

          {/* Only one button for collapse/expand all */}
          {baggages.length > 0 && (
            isAnyCollapsed ? (
              <button
                onClick={() => setAllCollapsed(false)}
                className="expand-all-btn"
                title="Expand All Bags"
              >
                Expand All
              </button>
            ) : (
              <button
                onClick={() => setAllCollapsed(true)}
                className="collapse-all-btn"
                title="Collapse All Bags"
              >
                Collapse All
              </button>
            )
          )}

          <button
            onClick={clearAllData}
            className="clear-all-btn"
            disabled={baggages.length === 0}
          >
            <PiTrash style={{ marginRight: "5px" }} />
            Clear All
          </button>
        </div>
      </header>

      <div className="add-baggage-section">
        <h2>Add Baggage:</h2>
        <div className="baggage-type-buttons">
          {baggageTypes.map((type) => (
            <button
              key={type}
              onClick={() => addBaggage(type)}
              className="add-baggage-btn"
            >
              <PiPlus />
              {type.replace("-", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="baggages-container">
        {baggages.length === 0 ? (
          <div className="empty-state">
            <PiSuitcase />
            <p>No baggage added yet. Start by adding your first bag!</p>
          </div>
        ) : (
          baggages.map((baggage) => (
            <BaggageCard
              key={baggage.id}
              baggage={baggage}
              onUpdate={updateBaggage}
              onDelete={deleteBaggage}
              defaultItems={DEFAULT_ITEMS}
              collapsed={!!collapsedMap[baggage.id]}
              setCollapsed={(val: boolean) => setCollapsedMap((prev) => ({ ...prev, [baggage.id]: val }))}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
