import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { GEAR_ITEMS } from '../constants';
import SFX from '../utils/sfx';

const SLOT_META = {
  head: { label: 'Kopf', icon: 'face', emptyIcon: 'add_circle' },
  back: { label: 'Rücken', icon: 'checkroom', emptyIcon: 'add_circle' },
  neck: { label: 'Hals', icon: 'diamond', emptyIcon: 'add_circle' },
};

const RARITY_STYLES = {
  common: { bg: 'rgba(232,225,218,0.6)', border: 'rgba(0,0,0,0.08)', label: 'Gewöhnlich', color: '#7b7486' },
  rare: { bg: 'rgba(83,0,183,0.06)', border: 'rgba(83,0,183,0.15)', label: 'Selten', color: '#5300b7' },
  epic: { bg: 'rgba(252,211,77,0.12)', border: 'rgba(252,211,77,0.4)', label: 'Episch', color: '#b45309' },
};

export default function GearVault() {
  const { state, actions } = useTask();
  const [selectedGear, setSelectedGear] = useState(null);

  if (!state) return null;

  const inventory = state.gearInventory || [];
  const equipped = state.equippedGear || {};
  const ownedGear = GEAR_ITEMS.filter(g => inventory.includes(g.id));
  const hasGear = ownedGear.length > 0;

  const handleSlotTap = (slot) => {
    if (equipped[slot]) {
      SFX.play('pop');
      actions.unequipGear(slot);
      setSelectedGear(null);
    }
  };

  const handleItemTap = (gear) => {
    SFX.play('tap');
    if (equipped[gear.slot] === gear.id) {
      actions.unequipGear(gear.slot);
      setSelectedGear(null);
    } else {
      actions.equipGear(gear.id);
      setSelectedGear(null);
      SFX.play('pop');
    }
  };

  const totalStats = ownedGear.reduce((acc, g) => {
    if (equipped[g.slot] === g.id) {
      acc.defense += g.stats.defense || 0;
      acc.courage += g.stats.courage || 0;
    }
    return acc;
  }, { defense: 0, courage: 0 });

  return (
    <section className="rounded-2xl p-6 mb-6 relative overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid white', boxShadow: '0 8px 32px -4px rgba(0,0,0,0.1)' }}>
      <h3 className="font-headline font-bold text-xl mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
        Ausrüstungs-Tresor
      </h3>
      <p className="text-xs font-label text-on-surface-variant mb-5">Rüste Ronki mit Beute aus Epischen Missionen aus!</p>

      {/* Equipment Slots */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {['head', 'back', 'neck'].map(slot => {
          const meta = SLOT_META[slot];
          const equippedId = equipped[slot];
          const gear = equippedId ? GEAR_ITEMS.find(g => g.id === equippedId) : null;
          const rarity = gear ? RARITY_STYLES[gear.rarity] : null;

          return (
            <button key={slot}
              onClick={() => handleSlotTap(slot)}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative shadow-sm transition-all"
                   style={{
                     background: gear ? rarity.bg : 'rgba(232,225,218,0.4)',
                     border: gear ? `2px solid ${rarity.border}` : '2px dashed rgba(204,195,215,0.5)',
                   }}>
                {gear ? (
                  <>
                    <span className="material-symbols-outlined text-3xl"
                          style={{ color: gear.color, fontVariationSettings: "'FILL' 1" }}>
                      {gear.icon}
                    </span>
                    {/* Equipped indicator */}
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                         style={{ background: '#059669' }}>
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>check</span>
                    </div>
                  </>
                ) : (
                  <span className="material-symbols-outlined text-2xl" style={{ color: 'rgba(204,195,215,0.6)' }}>
                    {meta.emptyIcon}
                  </span>
                )}
              </div>
              <span className="font-label font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">
                {meta.label}
              </span>
              {gear && (
                <span className="text-[9px] font-label font-bold px-2 py-0.5 rounded-full"
                      style={{ background: rarity.bg, color: rarity.color }}>
                  {gear.name.split(' ')[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Stats */}
      {(totalStats.defense > 0 || totalStats.courage > 0) && (
        <div className="flex gap-3 mb-5">
          {totalStats.defense > 0 && (
            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl"
                 style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.15)' }}>
              <span className="material-symbols-outlined text-lg" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>shield</span>
              <div>
                <p className="font-label font-bold text-[10px] text-on-surface-variant uppercase">Verteidigung</p>
                <p className="font-headline font-bold text-lg" style={{ color: '#059669' }}>+{totalStats.defense}</p>
              </div>
            </div>
          )}
          {totalStats.courage > 0 && (
            <div className="flex-1 flex items-center gap-2 p-3 rounded-xl"
                 style={{ background: 'rgba(83,0,183,0.06)', border: '1px solid rgba(83,0,183,0.12)' }}>
              <span className="material-symbols-outlined text-lg" style={{ color: '#5300b7', fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <div>
                <p className="font-label font-bold text-[10px] text-on-surface-variant uppercase">Mut</p>
                <p className="font-headline font-bold text-lg text-primary">+{totalStats.courage}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Grid */}
      {hasGear ? (
        <>
          <p className="font-label font-bold text-xs text-outline uppercase tracking-widest mb-3">Inventar ({ownedGear.length}/{GEAR_ITEMS.length})</p>
          <div className="grid grid-cols-3 gap-3">
            {ownedGear.map(gear => {
              const isEquipped = equipped[gear.slot] === gear.id;
              const rarity = RARITY_STYLES[gear.rarity];
              return (
                <button key={gear.id}
                  onClick={() => handleItemTap(gear)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl active:scale-90 transition-all"
                  style={{
                    background: isEquipped ? rarity.bg : 'rgba(249,243,235,0.8)',
                    border: isEquipped ? `2px solid ${gear.color}` : '1px solid rgba(0,0,0,0.04)',
                    boxShadow: isEquipped ? `0 0 12px ${gear.color}20` : 'none',
                  }}>
                  <span className="material-symbols-outlined text-2xl"
                        style={{ color: gear.color, fontVariationSettings: "'FILL' 1" }}>
                    {gear.icon}
                  </span>
                  <span className="font-label font-bold text-[10px] text-on-surface text-center leading-tight">
                    {gear.name}
                  </span>
                  <span className="text-[8px] font-label font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: rarity.bg, color: rarity.color }}>
                    {rarity.label}
                  </span>
                  {gear.stats.defense && (
                    <span className="text-[9px] font-label text-on-surface-variant">🛡 +{gear.stats.defense}</span>
                  )}
                  {gear.stats.courage && (
                    <span className="text-[9px] font-label text-on-surface-variant">⚡ +{gear.stats.courage}</span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="material-symbols-outlined text-4xl mb-2" style={{ color: 'rgba(204,195,215,0.5)' }}>inventory_2</span>
          <p className="font-body text-sm text-on-surface-variant">Noch keine Ausrüstung gesammelt.</p>
          <p className="font-body text-xs text-outline mt-1">Schließe Epische Missionen ab, um Beute zu erhalten!</p>
        </div>
      )}
    </section>
  );
}
