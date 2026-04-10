import React, { useState } from 'react';
import { T, GEAR_SLOTS, SHOP_ITEMS } from '../constants';

function findItem(id) {
  for (const cat of Object.values(SHOP_ITEMS)) {
    const item = cat.find(i => i.id === id);
    if (item) return item;
  }
  return null;
}

const SLOT_KEYS = ["head", "body", "accessory"];

export default function GearSlots({ equippedGear, purchased, onEquip, onUnequip }) {
  const [openSlot, setOpenSlot] = useState(null);

  const toggleSlot = (slot) => {
    setOpenSlot(prev => prev === slot ? null : slot);
  };

  const availableItems = (slot) => {
    const slotDef = GEAR_SLOTS[slot];
    if (!slotDef) return [];
    return slotDef.items
      .filter(id => purchased.includes(id))
      .map(id => ({ ...findItem(id), id }))
      .filter(Boolean);
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Slot pills row */}
      <div style={{
        display: "flex", gap: 6, justifyContent: "center",
      }}>
        {SLOT_KEYS.map(slot => {
          const slotDef = GEAR_SLOTS[slot];
          const equippedId = equippedGear[slot];
          const equippedItem = equippedId ? findItem(equippedId) : null;
          const isOpen = openSlot === slot;
          const hasGear = !!equippedItem;

          return (
            <button
              key={slot}
              className="btn-tap"
              onClick={() => toggleSlot(slot)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                height: 44, padding: "0 10px",
                borderRadius: 50,
                border: hasGear
                  ? `2px solid ${T.accentDark}`
                  : `2px solid rgba(0,0,0,0.08)`,
                background: hasGear
                  ? "linear-gradient(135deg, rgba(252,211,77,0.15), rgba(245,158,11,0.08))"
                  : isOpen ? "rgba(109,40,217,0.06)" : "rgba(0,0,0,0.03)",
                cursor: "pointer",
                fontFamily: "'Fredoka',sans-serif",
                fontSize: ".85rem",
                fontWeight: 700,
                color: hasGear ? T.accentDark : T.textSecondary,
                whiteSpace: "nowrap",
                boxShadow: isOpen ? `0 0 0 2px ${T.primaryLight}40` : "none",
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{slotDef.icon}</span>
              <span>{equippedItem ? equippedItem.name : "Leer"}</span>
            </button>
          );
        })}
      </div>

      {/* Inline picker */}
      {openSlot && (() => {
        const items = availableItems(openSlot);
        const equippedId = equippedGear[openSlot];

        if (items.length === 0) {
          return (
            <div style={{
              marginTop: 8, padding: "10px 12px",
              background: "rgba(0,0,0,0.02)",
              borderRadius: 14,
              border: "1.5px solid rgba(0,0,0,0.05)",
              textAlign: "center",
              fontFamily: "'Fredoka',sans-serif",
              fontSize: ".9rem",
              color: T.textLight,
            }}>
              Noch keine Items - besuche den Shop!
            </div>
          );
        }

        return (
          <div style={{
            marginTop: 8, padding: 8,
            background: "rgba(255,255,255,0.8)",
            borderRadius: 14,
            border: "1.5px solid rgba(0,0,0,0.06)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            display: "flex", gap: 6, flexWrap: "wrap",
            justifyContent: "center",
          }}>
            {items.map(item => {
              const isEquipped = equippedId === item.id;
              return (
                <button
                  key={item.id}
                  className="btn-tap"
                  onClick={() => {
                    if (isEquipped) {
                      onUnequip(openSlot);
                    } else {
                      onEquip(openSlot, item.id);
                    }
                    setOpenSlot(null);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 12px",
                    borderRadius: 50,
                    border: isEquipped
                      ? `2px solid ${T.accentDark}`
                      : "2px solid rgba(0,0,0,0.06)",
                    background: isEquipped
                      ? "linear-gradient(135deg, rgba(252,211,77,0.2), rgba(245,158,11,0.1))"
                      : "rgba(255,255,255,0.9)",
                    cursor: "pointer",
                    fontFamily: "'Fredoka',sans-serif",
                    fontSize: ".85rem",
                    fontWeight: 700,
                    color: isEquipped ? T.accentDark : T.textPrimary,
                    boxShadow: isEquipped ? `0 0 0 2px ${T.accent}40` : "0 1px 4px rgba(0,0,0,0.05)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: "1.05rem" }}>{item.icon}</span>
                  <span>{item.name}</span>
                  {isEquipped && <span style={{ fontSize: ".75rem", marginLeft: 2 }}>x</span>}
                </button>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
