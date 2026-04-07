import React, { useState } from 'react';
import { imageUrl } from '../lib/url';

export default function ProductImage({ src, alt, className = '', thumb, ratio = 'aspect-[4/3]' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const displaySrc = imageUrl(src || '/placeholder.png');
  return (
    <div className={ratio + ' relative bg-gray-100 overflow-hidden'}>
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
      )}
      <img
        src={displaySrc}
        alt={alt || 'image'}
        className={'w-full h-full object-cover ' + className + (loaded ? ' opacity-100' : ' opacity-0')}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(e) => { setError(true); e.currentTarget.src = '/placeholder.png'; setLoaded(true); }}
      />
    </div>
  );
}
