'use client';

import { useState } from 'react';


export default function ScraperPage() {
  const [companyName, setCompanyName] = useState('');
  const [facetGeoRegion, setFacetGeoRegion] = useState('');
  const [keywords, setKeywords] = useState('');
  const [profiles, setProfiles] = useState<{ name: string; position: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScrape = async () => {
    setLoading(true);
    setError('');
    setProfiles([]);

    try {
      const response = await fetch(
        `/api/scrape?companyName=${encodeURIComponent(companyName)}&facetGeoRegion=${encodeURIComponent(
          facetGeoRegion
        )}&keywords=${encodeURIComponent(keywords)}`
      );
      const result = await response.json();

      if (response.ok) {
        setProfiles(result.profiles);
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>LinkedIn Profile Scraper</h1>
      <div>
        <label>
          Company Name:
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., honeywell"
          />
        </label>
      </div>
      <div>
        <label>
          Facet Geo Region:
          <input
            type="text"
            value={facetGeoRegion}
            onChange={(e) => setFacetGeoRegion(e.target.value)}
            placeholder="e.g., 103644278"
          />
        </label>
      </div>
      <div>
        <label>
          Keywords:
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., director"
          />
        </label>
      </div>
      <button onClick={handleScrape} disabled={loading}>
        {loading ? 'Scraping...' : 'Scrape Profiles'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {profiles.map((profile, index) => (
          <li key={index}>
            <strong>{profile.name}</strong> - {profile.position}
          </li>
        ))}
      </ul>
    </div>

      
  );
}
