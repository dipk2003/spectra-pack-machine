'use client';
import { useId, useState } from 'react';
import Link from 'next/link';
type Machine = { slug: string; title: string; shortDesc: string };
export default function LocationPlanner({ state, district, machines, services, landingPage, initialTown = '', initialPin = '', initialProduct = '' }: { state: string; district: string; machines: Machine[]; services: { slug: string; title: string }[]; landingPage: string; initialTown?: string; initialPin?: string; initialProduct?: string }) {
  const id = useId();
  const [selected, setSelected] = useState(initialProduct);
  const [service, setService] = useState('');
  const [town, setTown] = useState(initialTown);
  const [pin, setPin] = useState(initialPin);
  const machine = machines.find(item => item.slug === selected);
  const serviceTitle = services.find(item => item.slug === service)?.title;
  const location = [district + ' district', state].join(', ');
  return <div className="location-planner">
    <h2>Plan your machine or service enquiry</h2>
    <p>Select equipment and share the exact town and PIN code so the team can assess dispatch, installation access and service scope.</p>
    <form action="/contact" method="get">
      <input type="hidden" name="source" value="seo-district-planner" />
      <input type="hidden" name="location" value={location} />
      <input type="hidden" name="landing" value={landingPage} />
      <input type="hidden" name="machine" value={machine?.title || serviceTitle || ''} />
      <div className="location-form-grid">
        <div><label htmlFor={id+'-machine'}>Machine</label><select id={id+'-machine'} name="product" value={selected} onChange={event => setSelected(event.target.value)}><option value="">Help me select a machine</option>{machines.map(item => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></div>
        <div><label htmlFor={id+'-service'}>Service required</label><select id={id+'-service'} name="service" value={service} onChange={event => setService(event.target.value)}><option value="">Machine purchase enquiry</option>{services.map(item => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></div>
        <div><label htmlFor={id+'-town'}>City, town or village</label><input id={id+'-town'} name="town" value={town} onChange={event => setTown(event.target.value)} maxLength={120} autoComplete="address-level2" /></div>
        <div><label htmlFor={id+'-pin'}>Delivery PIN code</label><input id={id+'-pin'} name="pin" value={pin} onChange={event => setPin(event.target.value)} inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} autoComplete="postal-code" title="Enter a six-digit Indian PIN code" /></div>
      </div>
      {machine && <aside className="location-selection"><h3>{machine.title}</h3><p>{machine.shortDesc}</p><Link href={'/products/'+machine.slug}>Review machine specifications</Link></aside>}
      {service && <p><Link href={'/services/'+service}>Review {serviceTitle} scope</Link></p>}
      <button type="submit" className="btn btn-primary">Continue to enquiry</button>
      <p className="location-note">Dispatch cost, travel, installation and on-site availability are confirmed for your specific location and machine.</p>
    </form>
  </div>;
}
