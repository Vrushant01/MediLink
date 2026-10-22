import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../../api/axios';

// Searchable autocomplete picker for medicine master formulations
export default function MedicineSearchPicker({ medicine, onSelectMedicine, isEditing }) {
  const [medSearch, setMedSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (isEditing || !medSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/medicines', { params: { search: medSearch.trim() } });
        setSearchResults(res.data || []);
      } catch (err) {
        // Quiet fail on lookup
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [medSearch, isEditing]);

  return (
    <div>
      <label className="block text-[13px] font-sans font-medium text-ink-soft mb-1.5">
        Medicine formulation {!isEditing && <span className="text-ink-soft ml-0.5" title="Required">*</span>}
      </label>

      {isEditing ? (
        <div className="h-[42px] px-3 border border-line rounded-[6px] bg-paper/60 flex items-center justify-between text-sm font-sans">
          <span className="font-medium text-ink">
            {medicine?.name} ({medicine?.strength})
          </span>
          <span className="text-xs text-ink-soft">Locked during edit</span>
        </div>
      ) : medicine ? (
        <div className="h-[42px] px-3 border border-line rounded-[6px] bg-brand-soft/30 flex items-center justify-between text-sm font-sans">
          <div>
            <strong className="text-brand font-medium">{medicine.name}</strong>
            <span className="text-ink-soft text-xs ml-2">
              {medicine.genericName} • {medicine.strength}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectMedicine(null)}
            className="text-xs text-accent hover:underline font-medium"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-soft absolute left-3 top-3.5" />
            <input
              type="text"
              value={medSearch}
              onChange={(e) => setMedSearch(e.target.value)}
              placeholder="Type medicine name (e.g. Dolo 650, Azithral)..."
              className="w-full h-[42px] pl-9 pr-3 rounded-[6px] border border-line bg-surface text-[14px] font-sans text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft/60 transition-colors duration-150"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-12 bg-surface border border-line rounded-[6px] shadow-popover z-30 max-h-48 overflow-y-auto divide-y divide-line text-xs font-sans">
              {searchResults.map((m) => (
                <button
                  key={m._id}
                  type="button"
                  onClick={() => {
                    onSelectMedicine(m);
                    setMedSearch('');
                    setSearchResults([]);
                  }}
                  className="w-full text-left p-2.5 hover:bg-paper transition-colors flex items-center justify-between"
                >
                  <div>
                    <span className="font-medium text-ink text-sm">{m.name}</span>
                    <span className="text-ink-soft ml-2">({m.genericName})</span>
                  </div>
                  <span className="text-ink-soft">
                    {m.strength} • {m.form}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
