'use client';
import { useId, useState } from 'react';
import Link from 'next/link';
export default function DistrictDirectory({ stateSlug, stateName, districts }: { stateSlug: string; stateName: string; districts: { name: string; slug: string }[] }) {
  const [query, setQuery] = useState('');
  const id = useId();
  const visible = districts.filter(district => district.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className="location-directory">
    <label htmlFor={id}>Find your district in {stateName}</label>
    <input id={id} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search district name" />
    <p aria-live="polite">{visible.length} of {districts.length} districts</p>
    <ul>{visible.map(district => <li key={district.slug}><Link href={'/packaging-machines/india/' + stateSlug + '/' + district.slug}>{district.name}<span>Machine &amp; service enquiry →</span></Link></li>)}</ul>
    {!visible.length && <p>District names can change. Clear the search or <Link href="/contact">share your town and PIN code directly</Link>.</p>}
  </div>;
}
