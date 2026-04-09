import { describe, it, expect } from 'vitest';
import { validateImportData } from '../hooks/useGameActions';

const validState = {
  hero: { name: "TestHeld", shape: "cube", color: "#6D28D9", eyes: "round", hair: "short" },
  catVariant: "tiger",
  catName: "Rocket",
  xp: 100,
  coins: 50,
  quests: [
    { id: "s1", name: "Test Quest", icon: "⭐", anchor: "morning", xp: 10, minutes: 3, done: false, streak: 0 },
  ],
  sd: 5,
  dt: 0,
  hist: [],
  sm: {},
  purchased: [],
};

describe('validateImportData', () => {
  it('accepts valid state', () => {
    expect(validateImportData(validState)).toBe(true);
  });

  it('rejects null', () => {
    expect(validateImportData(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(validateImportData(undefined)).toBe(false);
  });

  it('rejects a string', () => {
    expect(validateImportData("not an object")).toBe(false);
  });

  it('rejects empty object', () => {
    expect(validateImportData({})).toBe(false);
  });

  it('rejects missing hero', () => {
    const data = { ...validState, hero: undefined };
    expect(validateImportData(data)).toBe(false);
  });

  it('rejects hero without name', () => {
    const data = { ...validState, hero: { shape: "cube", color: "#fff" } };
    expect(validateImportData(data)).toBe(false);
  });

  it('rejects hero without shape', () => {
    const data = { ...validState, hero: { name: "Test", color: "#fff" } };
    expect(validateImportData(data)).toBe(false);
  });

  it('rejects missing quests', () => {
    const data = { ...validState, quests: undefined };
    expect(validateImportData(data)).toBe(false);
  });

  it('rejects quests that is not an array', () => {
    const data = { ...validState, quests: "not-array" };
    expect(validateImportData(data)).toBe(false);
  });

  it('rejects quests with invalid items', () => {
    const data = { ...validState, quests: [{ notId: true }] };
    expect(validateImportData(data)).toBe(false);
  });

  it('rejects non-numeric xp', () => {
    const data = { ...validState, xp: "100" };
    expect(validateImportData(data)).toBe(false);
  });

  it('rejects non-numeric coins', () => {
    const data = { ...validState, coins: null };
    expect(validateImportData(data)).toBe(false);
  });

  it('accepts empty quests array', () => {
    const data = { ...validState, quests: [] };
    expect(validateImportData(data)).toBe(true);
  });

  it('rejects an array as top-level data', () => {
    expect(validateImportData([1, 2, 3])).toBe(false);
  });
});
