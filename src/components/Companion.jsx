import React from 'react';
import CatSidekick from './CatSidekick';
import DragonSidekick from './DragonSidekick';
import WolfSidekick from './WolfSidekick';
import PhoenixSidekick from './PhoenixSidekick';

export default function Companion({ type = "cat", variant, mood, size, stage, gear }) {
  switch (type) {
    case "dragon": return <DragonSidekick variant={variant} mood={mood} size={size} stage={stage} gear={gear} />;
    case "wolf": return <WolfSidekick variant={variant} mood={mood} size={size} stage={stage} gear={gear} />;
    case "phoenix": return <PhoenixSidekick variant={variant} mood={mood} size={size} stage={stage} gear={gear} />;
    default: return <CatSidekick variant={variant} mood={mood} size={size} stage={stage} gear={gear} />;
  }
}
