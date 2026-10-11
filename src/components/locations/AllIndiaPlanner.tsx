'use client';

import { useId, useState } from 'react';

type Region = { slug: string; name: string; districts: { name: string; slug: string }[] };
export default function AllIndiaPlanner({ regions, machines }: { regions: Region[]; machines: { slug: string; title: string }[] }) {
  const id = useId();
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const selectedRegion = regions.find(region => region.slug === state);
  return <form className="location-planner" action="/packaging-machines/plan" method="get">
    <h2>Find machines for your delivery location</h2>
    <p>Select a state and district, then enter any town or village and its delivery PIN. You can review the local enquiry plan before contacting the team.</p>
    <div className="location-form-grid">
      <div><label htmlFor={id + '-state'}>State / union territory</label><select id={id + '-state'} name="state" required value={state} onChange={event => { setState(event.target.value); setDistrict(''); }}>
        <option value="">Choose a state / UT</option>{regions.map(region => <option value={region.slug} key={region.slug}>{region.name}</option>)}
      </select></div>
      <div><label htmlFor={id + '-district'}>District</label><select id={id + '-district'} name="district" required value={district} onChange={event => setDistrict(event.target.value)}>
        <option value="">Choose a district</option>{(selectedRegion ? [selectedRegion] : regions).map(region => <optgroup label={region.name} key={region.slug}>{region.districts.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</optgroup>)}
      </select></div>
      <div><label htmlFor={id + '-town'}>Town / city / village</label><input id={id + '-town'} name="town" maxLength={120} autoComplete="address-level2" /></div>
      <div><label htmlFor={id + '-pin'}>Delivery PIN code</label><input id={id + '-pin'} name="pin" pattern="[1-9][0-9]{5}" maxLength={6} inputMode="numeric" autoComplete="postal-code" title="Enter a six-digit Indian PIN code" /></div>
      <div><label htmlFor={id + '-product'}>Machine interest</label><select id={id + '-product'} name="product"><option value="">Help me choose a machine</option>{machines.map(machine => <option value={machine.slug} key={machine.slug}>{machine.title}</option>)}</select></div>
    </div>
    <button type="submit" className="btn btn-primary">View my location enquiry plan</button>
    <p className="location-note">All India enquiries are welcome. The team confirms freight, installation and service arrangements for your actual site; this directory is not a list of local branches.</p>
  </form>;
}
