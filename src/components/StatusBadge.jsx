import React from 'react';
import { STATUS_BADGE } from '../utils';

export default function StatusBadge({ status }) {
  const cls = STATUS_BADGE[status] || 'badge-gray';
  return <span className={`badge ${cls}`}>{status}</span>;
}
