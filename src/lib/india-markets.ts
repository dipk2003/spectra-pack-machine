export type IndiaStateMarket = {
  slug: string;
  name: string;
  kind: 'State' | 'Union Territory';
  majorMarkets: readonly string[];
  focusIndustries: readonly string[];
};

/**
 * A deliberately compact, browsable India coverage directory.
 *
 * We create one useful hub per state/UT instead of thousands of near-duplicate
 * district pages. The market names are delivery/service areas, not branch-office
 * claims; every public page makes that distinction explicit.
 */
export const INDIA_STATE_MARKETS: readonly IndiaStateMarket[] = [
  { slug: 'andhra-pradesh', name: 'Andhra Pradesh', kind: 'State', majorMarkets: ['Visakhapatnam', 'Vijayawada', 'Sri City', 'Tirupati', 'Kakinada'], focusIndustries: ['food and beverage', 'pharmaceuticals', 'ports and logistics'] },
  { slug: 'arunachal-pradesh', name: 'Arunachal Pradesh', kind: 'State', majorMarkets: ['Itanagar', 'Naharlagun', 'Pasighat', 'Bhalukpong'], focusIndustries: ['food processing', 'agriculture', 'consumer goods'] },
  { slug: 'assam', name: 'Assam', kind: 'State', majorMarkets: ['Guwahati', 'Dibrugarh', 'Tinsukia', 'Silchar', 'Bongaigaon'], focusIndustries: ['tea and food processing', 'consumer goods', 'warehousing'] },
  { slug: 'bihar', name: 'Bihar', kind: 'State', majorMarkets: ['Patna', 'Hajipur', 'Muzaffarpur', 'Begusarai', 'Gaya'], focusIndustries: ['food processing', 'dairy', 'general manufacturing'] },
  { slug: 'chhattisgarh', name: 'Chhattisgarh', kind: 'State', majorMarkets: ['Raipur', 'Bhilai', 'Durg', 'Bilaspur', 'Korba'], focusIndustries: ['metals', 'food processing', 'industrial components'] },
  { slug: 'goa', name: 'Goa', kind: 'State', majorMarkets: ['Verna', 'Ponda', 'Kundaim', 'Mapusa', 'Margao'], focusIndustries: ['pharmaceuticals', 'food and beverage', 'consumer products'] },
  { slug: 'gujarat', name: 'Gujarat', kind: 'State', majorMarkets: ['Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 'Vapi', 'Sanand'], focusIndustries: ['pharmaceuticals', 'chemicals', 'engineering and FMCG'] },
  { slug: 'haryana', name: 'Haryana', kind: 'State', majorMarkets: ['Gurugram', 'Faridabad', 'Manesar', 'Panipat', 'Sonipat'], focusIndustries: ['automotive', 'food processing', 'warehousing and logistics'] },
  { slug: 'himachal-pradesh', name: 'Himachal Pradesh', kind: 'State', majorMarkets: ['Baddi', 'Parwanoo', 'Solan', 'Una', 'Kala Amb'], focusIndustries: ['pharmaceuticals', 'FMCG', 'food processing'] },
  { slug: 'jharkhand', name: 'Jharkhand', kind: 'State', majorMarkets: ['Jamshedpur', 'Ranchi', 'Bokaro', 'Dhanbad', 'Adityapur'], focusIndustries: ['metals', 'industrial components', 'general manufacturing'] },
  { slug: 'karnataka', name: 'Karnataka', kind: 'State', majorMarkets: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi', 'Tumakuru'], focusIndustries: ['food and beverage', 'engineering', 'pharmaceuticals and electronics'] },
  { slug: 'kerala', name: 'Kerala', kind: 'State', majorMarkets: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Palakkad'], focusIndustries: ['food and spices', 'consumer goods', 'logistics'] },
  { slug: 'madhya-pradesh', name: 'Madhya Pradesh', kind: 'State', majorMarkets: ['Indore', 'Bhopal', 'Pithampur', 'Dewas', 'Gwalior', 'Jabalpur'], focusIndustries: ['pharmaceuticals', 'food processing', 'engineering'] },
  { slug: 'maharashtra', name: 'Maharashtra', kind: 'State', majorMarkets: ['Mumbai', 'Navi Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Chhatrapati Sambhajinagar', 'Thane', 'Vasai-Virar'], focusIndustries: ['pharmaceuticals', 'FMCG', 'engineering and logistics'] },
  { slug: 'manipur', name: 'Manipur', kind: 'State', majorMarkets: ['Imphal', 'Thoubal', 'Churachandpur'], focusIndustries: ['food processing', 'consumer goods', 'small manufacturing'] },
  { slug: 'meghalaya', name: 'Meghalaya', kind: 'State', majorMarkets: ['Shillong', 'Byrnihat', 'Tura'], focusIndustries: ['food processing', 'beverages', 'consumer goods'] },
  { slug: 'mizoram', name: 'Mizoram', kind: 'State', majorMarkets: ['Aizawl', 'Lunglei', 'Kolasib'], focusIndustries: ['food processing', 'agriculture', 'consumer goods'] },
  { slug: 'nagaland', name: 'Nagaland', kind: 'State', majorMarkets: ['Dimapur', 'Kohima', 'Chumoukedima'], focusIndustries: ['food processing', 'agriculture', 'consumer goods'] },
  { slug: 'odisha', name: 'Odisha', kind: 'State', majorMarkets: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Angul', 'Jharsuguda', 'Paradip'], focusIndustries: ['metals', 'food processing', 'ports and logistics'] },
  { slug: 'punjab', name: 'Punjab', kind: 'State', majorMarkets: ['Ludhiana', 'Jalandhar', 'Amritsar', 'Mohali', 'Bathinda'], focusIndustries: ['food and dairy', 'engineering', 'consumer goods'] },
  { slug: 'rajasthan', name: 'Rajasthan', kind: 'State', majorMarkets: ['Jaipur', 'Bhiwadi', 'Neemrana', 'Jodhpur', 'Udaipur', 'Kota'], focusIndustries: ['engineering', 'food processing', 'consumer goods'] },
  { slug: 'sikkim', name: 'Sikkim', kind: 'State', majorMarkets: ['Gangtok', 'Rangpo', 'Singtam', 'Jorethang'], focusIndustries: ['pharmaceuticals', 'food and beverage', 'consumer goods'] },
  { slug: 'tamil-nadu', name: 'Tamil Nadu', kind: 'State', majorMarkets: ['Chennai', 'Coimbatore', 'Hosur', 'Tiruppur', 'Sriperumbudur', 'Madurai'], focusIndustries: ['automotive', 'textiles', 'food and engineering'] },
  { slug: 'telangana', name: 'Telangana', kind: 'State', majorMarkets: ['Hyderabad', 'Patancheru', 'Sangareddy', 'Warangal', 'Medchal'], focusIndustries: ['pharmaceuticals', 'food processing', 'engineering'] },
  { slug: 'tripura', name: 'Tripura', kind: 'State', majorMarkets: ['Agartala', 'Bodhjungnagar', 'Dharmanagar'], focusIndustries: ['food processing', 'rubber products', 'consumer goods'] },
  { slug: 'uttar-pradesh', name: 'Uttar Pradesh', kind: 'State', majorMarkets: ['Noida', 'Greater Noida', 'Ghaziabad', 'Kanpur', 'Lucknow', 'Agra', 'Varanasi'], focusIndustries: ['FMCG', 'food processing', 'electronics and logistics'] },
  { slug: 'uttarakhand', name: 'Uttarakhand', kind: 'State', majorMarkets: ['Haridwar', 'Rudrapur', 'Pantnagar', 'Dehradun', 'Kashipur'], focusIndustries: ['pharmaceuticals', 'FMCG', 'automotive'] },
  { slug: 'west-bengal', name: 'West Bengal', kind: 'State', majorMarkets: ['Kolkata', 'Howrah', 'Durgapur', 'Haldia', 'Siliguri', 'Dankuni'], focusIndustries: ['food and beverage', 'engineering', 'ports and logistics'] },
  { slug: 'andaman-and-nicobar-islands', name: 'Andaman and Nicobar Islands', kind: 'Union Territory', majorMarkets: ['Port Blair', 'Bambooflat', 'Garacharma'], focusIndustries: ['food processing', 'hospitality supplies', 'consumer goods'] },
  { slug: 'chandigarh', name: 'Chandigarh', kind: 'Union Territory', majorMarkets: ['Chandigarh', 'Industrial Area Phase I', 'Industrial Area Phase II'], focusIndustries: ['consumer goods', 'food processing', 'regional distribution'] },
  { slug: 'dadra-and-nagar-haveli-and-daman-and-diu', name: 'Dadra and Nagar Haveli and Daman and Diu', kind: 'Union Territory', majorMarkets: ['Silvassa', 'Daman', 'Dadra', 'Dabhel'], focusIndustries: ['plastics', 'pharmaceuticals', 'FMCG and engineering'] },
  { slug: 'delhi', name: 'Delhi', kind: 'Union Territory', majorMarkets: ['Okhla', 'Bawana', 'Narela', 'Naraina'], focusIndustries: ['food processing', 'consumer goods', 'warehousing and distribution'] },
  { slug: 'jammu-and-kashmir', name: 'Jammu and Kashmir', kind: 'Union Territory', majorMarkets: ['Jammu', 'Srinagar', 'Samba', 'Kathua', 'Bari Brahmana'], focusIndustries: ['food and horticulture', 'pharmaceuticals', 'consumer goods'] },
  { slug: 'ladakh', name: 'Ladakh', kind: 'Union Territory', majorMarkets: ['Leh', 'Kargil'], focusIndustries: ['food packing', 'hospitality supplies', 'regional distribution'] },
  { slug: 'lakshadweep', name: 'Lakshadweep', kind: 'Union Territory', majorMarkets: ['Kavaratti', 'Agatti', 'Andrott'], focusIndustries: ['food packing', 'hospitality supplies', 'consumer goods'] },
  { slug: 'puducherry', name: 'Puducherry', kind: 'Union Territory', majorMarkets: ['Puducherry', 'Karaikal', 'Yanam', 'Mahe'], focusIndustries: ['food processing', 'chemicals', 'consumer goods'] },
] as const;

export const findIndiaStateMarket = (slug: string) =>
  INDIA_STATE_MARKETS.find((market) => market.slug === slug);
