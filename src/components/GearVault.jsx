import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useTranslation } from '../i18n/LanguageContext';
import { GEAR_ITEMS } from '../constants';
import SFX from '../utils/sfx';

const SLOT_META = {
  head: { key: 'gear.slot.head', icon: 'face', emptyIcon: 'add_circle' },
  back: { key: 'gear.slot.back', icon: 'checkroom', emptyIcon: 'add_circle' },
  neck: { key: 'gear.slot.neck', icon: 'diamond', emptyIcon: 'add_circle' },
};

const RARITY_STYLES = {
  common: { bg: 'rgba(232,225,218,0.6)', border: 'rgba(0,0,0,0.08)', key: 'gear.rarity.common', color: '#7b7486' },
  rare: { bg: 'rgba(18,67,70,0.06)', border: 'rgba(18,67,70,0.15)', key: 'gear.rarity.rare', color: '#124346' },
  epic: { bg: 'rgba(252,211,77,0.12)', border: 'rgba(252,211,77,0.4)', key: 'gear.rarity.epic', color: '#b45309' },
};

export default function GearVault() {
  const { state, actions } = useTask();
  const { t } = useTranslation();
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
        {t('gear.title')}
      </h3>
      <p className="text-xs font-label text-on-surface-variant mb-5">{t('gear.subtitle')}</p>

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
              <span className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant">
                {t(meta.key)}
              </span>
              {gear && (
                <span className="text-xs font-label font-bold px-2 py-0.5 rounded-full"
                      style={{ background: rarity.bg, color: rarity.color }}>
                  {t('gear.' + gear.id).split(' ')[0]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Stats with effect explanation */}
      {(totalStats.defense > 0 || totalStats.courage > 0) && (
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex gap-3">
            {totalStats.courage > 0 && (
              <div className="flex-1 flex items-center gap-2 p-3 rounded-xl"
                   style={{ background: 'rgba(252,211,77,0.1)', border: '1px solid rgba(252,211,77,0.3)' }}>
                <span className="material-symbols-outlined text-lg" style={{ color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <div>
                  <p className="font-label font-bold text-xs text-on-surface-variant uppercase">{t('gear.courage')}</p>
                  <p className="font-headline font-bold text-lg" style={{ color: '#b45309' }}>+{totalStats.courage}</p>
                </div>
              </div>
            )}
            {totalStats.defense > 0 && (
              <div className="flex-1 flex items-center gap-2 p-3 rounded-xl"
                   style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.15)' }}>
                <span className="material-symbols-outlined text-lg" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>shield</span>
                <div>
                  <p className="font-label font-bold text-xs text-on-surface-variant uppercase">{t('gear.defense')}</p>
                  <p className="font-headline font-bold text-lg" style={{ color: '#059669' }}>+{totalStats.defense}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-start gap-2 px-2">
            <span className="material-symbols-outlined text-sm text-on-surface-variant/50 mt-0.5">info</span>
            <p className="font-label text-xs text-on-surface-variant leading-relaxed">
              {t('gear.statExplain')}
            </p>
          </div>
        </div>
      )}

      {/* Inventory List */}
      {hasGear ? (
        <>
          <p className="font-label font-bold text-xs text-outline uppercase tracking-widest mb-3">{t('gear.inventory')} ({ownedGear.length}/{GEAR_ITEMS.length})</p>
          <div className="flex flex-col gap-2.5">
            {ownedGear.map(gear => {
              const isEquipped = equipped[gear.slot] === gear.id;
              const rarity = RARITY_STYLES[gear.rarity];
              const isSelected = selectedGear === gear.id;
              return (
                <div key={gear.id}>
                  <button
                    onClick={() => {
                      if (isSelected) { handleItemTap(gear); }
                      else { setSelectedGear(gear.id); }
                    }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl active:scale-[0.98] transition-all text-left"
                    style={{
                      background: isEquipped ? rarity.bg : 'rgba(249,243,235,0.8)',
                      border: isEquipped ? `2px solid ${gear.color}` : '1.5px solid rgba(0,0,0,0.08)',
                      boxShadow: isEquipped ? `0 0 16px ${gear.color}15` : 'none',
                    }}>
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                         style={{ background: `${gear.color}15` }}>
                      <span className="material-symbols-outlined text-2xl"
                            style={{ color: gear.color, fontVariationSettings: "'FILL' 1" }}>
                        {gear.icon}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-headline font-bold text-sm text-on-surface">{t('gear.' + gear.id)}</span>
                        {isEquipped && (
                          <span className="material-symbols-outlined text-sm" style={{ color: '#059669', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-label font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                              style={{ background: rarity.bg, color: rarity.color }}>
                          {t(rarity.key)}
                        </span>
                        <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider">
                          {t(SLOT_META[gear.slot]?.key)}
                        </span>
                      </div>
                    </div>
                    {/* Stats */}
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {gear.stats.courage > 0 && (
                        <span className="font-label font-bold text-xs" style={{ color: '#f59e0b' }}>⚡ +{gear.stats.courage}</span>
                      )}
                      {gear.stats.defense > 0 && (
                        <span className="font-label font-bold text-xs" style={{ color: '#059669' }}>🛡 +{gear.stats.defense}</span>
                      )}
                    </div>
                  </button>
                  {/* Expanded detail */}
                  {isSelected && (
                    <div className="mx-3 mt-1 p-3 rounded-xl space-y-2"
                         style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${gear.color}30` }}>
                      <p className="font-body text-xs text-on-surface-variant italic leading-relaxed">
                        &ldquo;{t('gear.' + gear.id + '.desc')}&rdquo;
                      </p>
                      <button onClick={() => handleItemTap(gear)}
                        className="w-full py-2.5 rounded-lg font-label font-bold text-xs active:scale-95 transition-all"
                        style={{
                          background: isEquipped ? 'rgba(186,26,26,0.06)' : gear.color,
                          color: isEquipped ? '#ba1a1a' : '#ffffff',
                          border: isEquipped ? '1px solid rgba(186,26,26,0.15)' : 'none',
                        }}>
                        {isEquipped ? t('gear.unequip') : t('gear.equip')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="material-symbols-outlined text-4xl mb-2" style={{ color: 'rgba(204,195,215,0.5)' }}>inventory_2</span>
          <p className="font-body text-sm text-on-surface-variant">{t('gear.emptyTitle')}</p>
          <p className="font-body text-xs text-outline mt-1">{t('gear.emptyHint')}</p>
        </div>
      )}
    </section>
  );
}
