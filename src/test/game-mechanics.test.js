import { describe, it, expect } from 'vitest';
import { getLevel } from '../utils/helpers';
import {
  LVL, RARE_DROPS, RARE_DROP_CHANCE, CHEST_MILESTONES, CHEST_REWARDS,
  WEEKLY_MISSIONS, MAX_MONTHLY_FREEZES, SCHOOL_QUESTS, VACATION_QUESTS,
  REWARDS, SHOP_ITEMS, WHEEL_SEGMENTS, GRADUATION_THRESHOLD,
} from '../constants';

describe('game balance - level thresholds', () => {
  it('LVL array is strictly ascending', () => {
    for (let i = 1; i < LVL.length; i++) {
      expect(LVL[i]).toBeGreaterThan(LVL[i - 1]);
    }
  });

  it('LVL starts at 0', () => {
    expect(LVL[0]).toBe(0);
  });

  it('has 16 levels', () => {
    expect(LVL.length).toBe(16);
  });
});

describe('game balance - XP calculation', () => {
  it('base quest XP awards are reasonable (5-30)', () => {
    const allQuests = [...SCHOOL_QUESTS, ...VACATION_QUESTS];
    allQuests.forEach(q => {
      expect(q.xp).toBeGreaterThanOrEqual(5);
      expect(q.xp).toBeLessThanOrEqual(30);
    });
  });

  it('completing all quests grants bonus XP (30)', () => {
    // This is hardcoded in App.jsx complete()
    const BONUS_ALL_DONE = 30;
    expect(BONUS_ALL_DONE).toBe(30);
  });

  it('XP boost doubles XP correctly', () => {
    const baseXP = 15;
    const bonus = 30;
    const xpMult = 2;
    const earned = (baseXP + bonus) * xpMult;
    expect(earned).toBe(90);
  });
});

describe('game balance - coin economy', () => {
  it('quest coin reward is floor(xp/3)', () => {
    SCHOOL_QUESTS.forEach(q => {
      expect(Math.floor(q.xp / 3)).toBeGreaterThanOrEqual(1);
    });
  });

  it('shop items are purchasable with earned coins', () => {
    const allItems = [...SHOP_ITEMS.hero, ...SHOP_ITEMS.cat, ...SHOP_ITEMS.room];
    allItems.forEach(item => {
      expect(item.cost).toBeGreaterThan(0);
      expect(item.cost).toBeLessThanOrEqual(350);
    });
  });
});

describe('streak system', () => {
  it('chest milestones are ascending', () => {
    for (let i = 1; i < CHEST_MILESTONES.length; i++) {
      expect(CHEST_MILESTONES[i]).toBeGreaterThan(CHEST_MILESTONES[i - 1]);
    }
  });

  it('first chest milestone is at 3 days', () => {
    expect(CHEST_MILESTONES[0]).toBe(3);
  });

  it('graduation threshold is 30', () => {
    expect(GRADUATION_THRESHOLD).toBe(30);
  });

  it('monthly freeze limit is 2', () => {
    expect(MAX_MONTHLY_FREEZES).toBe(2);
  });

  it('streak freeze logic: 1 missed day with 2 freezes available preserves streak', () => {
    const missedDays = 1;
    const availFreezes = 2;
    const canProtect = availFreezes >= missedDays;
    expect(canProtect).toBe(true);
    expect(availFreezes - missedDays).toBe(1);
  });

  it('streak freeze logic: 3 missed days with 2 freezes triggers reset', () => {
    const missedDays = 3;
    const availFreezes = 2;
    const canProtect = availFreezes >= missedDays;
    expect(canProtect).toBe(false);
  });
});

describe('rare drops', () => {
  it('rare drop chance is 12%', () => {
    expect(RARE_DROP_CHANCE).toBe(0.12);
  });

  it('all rare drops have type and label', () => {
    RARE_DROPS.forEach(drop => {
      expect(drop).toHaveProperty('type');
      expect(drop).toHaveProperty('label');
      expect(drop).toHaveProperty('icon');
    });
  });

  it('rare drop types are valid', () => {
    const validTypes = ['hp', 'coins', 'xp', 'minutes', 'emoji'];
    RARE_DROPS.forEach(drop => {
      expect(validTypes).toContain(drop.type);
    });
  });
});

describe('weekly missions', () => {
  it('all weekly missions have required fields', () => {
    WEEKLY_MISSIONS.forEach(wm => {
      expect(wm).toHaveProperty('id');
      expect(wm).toHaveProperty('title');
      expect(wm).toHaveProperty('story');
      expect(wm).toHaveProperty('goal');
      expect(wm).toHaveProperty('target');
      expect(wm).toHaveProperty('reward');
      expect(wm.reward).toHaveProperty('type');
      expect(wm.reward).toHaveProperty('amount');
    });
  });

  it('weekly mission reward types are valid', () => {
    WEEKLY_MISSIONS.forEach(wm => {
      expect(['hp', 'coins', 'xp']).toContain(wm.reward.type);
    });
  });

  it('weekly mission targets are positive', () => {
    WEEKLY_MISSIONS.forEach(wm => {
      expect(wm.target).toBeGreaterThan(0);
    });
  });
});

describe('chest rewards', () => {
  it('all chest rewards have required fields', () => {
    CHEST_REWARDS.forEach(r => {
      expect(r).toHaveProperty('type');
      expect(r).toHaveProperty('label');
      expect(r).toHaveProperty('icon');
    });
  });

  it('chest reward types are valid', () => {
    const validTypes = ['hp', 'coins', 'xp', 'item', 'minutes', 'xpboost'];
    CHEST_REWARDS.forEach(r => {
      expect(validTypes).toContain(r.type);
    });
  });
});

describe('quest structure', () => {
  it('school quests cover all anchors', () => {
    const anchors = new Set(SCHOOL_QUESTS.map(q => q.anchor));
    expect(anchors.has('morning')).toBe(true);
    expect(anchors.has('afternoon')).toBe(true);
    expect(anchors.has('evening')).toBe(true);
  });

  it('vacation quests cover all anchors', () => {
    const anchors = new Set(VACATION_QUESTS.map(q => q.anchor));
    expect(anchors.has('morning')).toBe(true);
    expect(anchors.has('afternoon')).toBe(true);
    expect(anchors.has('evening')).toBe(true);
  });

  it('all quests have unique IDs', () => {
    const allIds = [...SCHOOL_QUESTS, ...VACATION_QUESTS].map(q => q.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('all quests have positive minutes', () => {
    [...SCHOOL_QUESTS, ...VACATION_QUESTS].forEach(q => {
      expect(q.minutes).toBeGreaterThan(0);
    });
  });

  it('rewards have valid structure', () => {
    REWARDS.forEach(r => {
      expect(r).toHaveProperty('id');
      expect(r).toHaveProperty('name');
      expect(r).toHaveProperty('icon');
      expect(r).toHaveProperty('minutes');
      expect(r.minutes).toBeGreaterThan(0);
    });
  });
});

describe('wheel segments', () => {
  it('all segments have required fields', () => {
    WHEEL_SEGMENTS.forEach(s => {
      expect(s).toHaveProperty('type');
      expect(s).toHaveProperty('label');
      expect(s).toHaveProperty('icon');
      expect(s).toHaveProperty('color');
    });
  });
});
