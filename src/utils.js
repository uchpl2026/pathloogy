export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const AVATAR_COLORS = ['#185FA5','#1D9E75','#854F0B','#993556','#3B6D11','#993C1D'];
export function avatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export function nextId(arr) {
  return arr.length ? Math.max(...arr.map(r => r.id)) + 1 : 1;
}

export const STATUS_BADGE = {
  Active:       'badge-green',
  Inactive:     'badge-gray',
  'On Duty':    'badge-teal',
  'Off Duty':   'badge-gray',
  Leave:        'badge-amber',
  Pending:      'badge-amber',
  Processing:   'badge-blue',
  Completed:    'badge-green',
  Cancelled:    'badge-red',
  Scheduled:    'badge-blue',
  'In Transit': 'badge-amber',
  Collected:    'badge-green',
  Failed:       'badge-red',
};
