export const BDA_LEAD_TYPES = [
  { id: 'iit_counselling', label: 'IIT Counselling' },
  { id: 'counsellor', label: 'Counsellor Program' },
  { id: 'one_on_one', label: 'One-on-One Counseling' },
];

export const BDA_LEAD_TYPE_MAP = Object.fromEntries(
  BDA_LEAD_TYPES.map((t) => [t.id, t.label])
);

export const DEFAULT_BDA_LEAD_TYPE = 'iit_counselling';

export function isIitLeadType(leadType) {
  return !leadType || leadType === 'iit_counselling';
}
