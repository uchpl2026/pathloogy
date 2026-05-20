import React from 'react';
import { getInitials, avatarColor } from '../utils';

export default function Avatar({ name = '', size = 28 }) {
  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: avatarColor(name),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 500,
        color: '#fff',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
