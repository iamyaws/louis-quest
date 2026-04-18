import { describe, it, expect } from 'vitest';
import { LEARN_TEMPLATE, EVENT_TEMPLATE, SKILL_TEMPLATE } from './questLineTemplates';

describe('questLineTemplates', () => {
  it('LEARN_TEMPLATE generates 7 days with topic injected', () => {
    const days = LEARN_TEMPLATE.dayGenerator({ title: 'Meerschweinchen' });
    expect(days).toHaveLength(7);
    expect(days[0].description).toContain('Meerschweinchen');
    expect(days[0].dayNumber).toBe(1);
    expect(days[6].dayNumber).toBe(7);
  });

  it('EVENT_TEMPLATE generates countdown ending in "Heute ist der Tag"', () => {
    const target = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
    const days = EVENT_TEMPLATE.dayGenerator({ title: 'Oma', targetDate: target });
    expect(days.length).toBeGreaterThanOrEqual(3);
    expect(days[days.length - 1].title).toContain('Heute');
    expect(days[days.length - 2].title).toContain('Morgen');
  });

  it('SKILL_TEMPLATE generates one day per milestone with isMilestone=true', () => {
    const days = SKILL_TEMPLATE.dayGenerator({ title: 'Schwimmen', milestones: ['A', 'B', 'C'] });
    expect(days).toHaveLength(3);
    expect(days.every(d => d.isMilestone === true)).toBe(true);
    expect(days.map(d => d.title)).toEqual(['A', 'B', 'C']);
  });

  it('EVENT_TEMPLATE returns empty array without targetDate', () => {
    const days = EVENT_TEMPLATE.dayGenerator({ title: 'Oma' });
    expect(days).toEqual([]);
  });
});
