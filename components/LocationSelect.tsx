"use client";

import { useState, useEffect, useRef } from "react";
import { Country, State, City } from "country-state-city";

interface LocationSelectProps {
    country: string;
    state: string;
    city: string;
    onChange: (name: string, value: string) => void;
    editing: boolean;
    error?: string;
    availableCountries?: string[];
}

export default function LocationSelect({ country, state, city, onChange, editing, error, availableCountries }: LocationSelectProps) {
    const [countries, setCountries] = useState<string[]>(availableCountries || []);
    const [states, setStates] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [loadingCountries, setLoadingCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    // Fetch Countries on mount
    useEffect(() => {
        if (availableCountries && availableCountries.length > 0) {
            setCountries(availableCountries);
            return;
        }

        if (!editing) return;

        setLoadingCountries(true);
        try {
            const allCountries = Country.getAllCountries();
            setCountries(allCountries.map(c => c.name).sort());
        } catch (err) {
            console.error("Failed to load countries", err);
        } finally {
            setLoadingCountries(false);
        }
    }, [editing, availableCountries]);

    // Fetch States when country changes
    useEffect(() => {
        if (!editing || !country) {
            setStates([]);
            return;
        }

        setLoadingStates(true);
        try {
            const countryObj = Country.getAllCountries().find(c => c.name === country);
            if (countryObj) {
                const countryStates = State.getStatesOfCountry(countryObj.isoCode);
                setStates(countryStates.map(s => s.name).sort());
            } else {
                setStates([]);
            }
        } catch (err) {
            console.error("Failed to load states", err);
            setStates([]);
        } finally {
            setLoadingStates(false);
        }
    }, [country, editing]);

    // Fetch Cities when state changes
    useEffect(() => {
        if (!editing || !country || !state) {
            setCities([]);
            return;
        }

        setLoadingCities(true);
        try {
            const countryObj = Country.getAllCountries().find(c => c.name === country);
            if (countryObj) {
                const stateObj = State.getStatesOfCountry(countryObj.isoCode).find(s => s.name === state);
                if (stateObj) {
                    const stateCities = City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode);
                    setCities(stateCities.map(c => c.name).sort());
                } else {
                    setCities([]);
                }
            } else {
                setCities([]);
            }
        } catch (err) {
            console.error("Failed to load cities", err);
            setCities([]);
        } finally {
            setLoadingCities(false);
        }
    }, [country, state, editing]);


    // Searchable Select Handlers are defined directly within the render below.

    if (!editing) {
        return (
            <>
                <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Country</span>
                    <p className="mt-1 text-gray-900 dark:text-white">{country || "—"}</p>
                </div>
                <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">State</span>
                    <p className="mt-1 text-gray-900 dark:text-white">{state || "—"}</p>
                </div>
                <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">City</span>
                    <p className="mt-1 text-gray-900 dark:text-white">{city || "—"}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Country {loadingCountries && <span className="text-indigo-500 lowercase">(loading...)</span>}
                </label>
                <SearchableSelect
                    value={country || ""}
                    options={countries}
                    onChange={(val) => {
                        onChange("country", val);
                        onChange("state", "");
                        onChange("city", "");
                    }}
                    placeholder={loadingCountries ? "Loading countries..." : "Select Country"}
                    searchPlaceholder="Search country..."
                    disabled={loadingCountries}
                    error={error}
                    loading={loadingCountries}
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    State {loadingStates && <span className="text-indigo-500 lowercase">(loading...)</span>}
                </label>
                <SearchableSelect
                    value={state || ""}
                    options={states}
                    onChange={(val) => {
                        onChange("state", val);
                        onChange("city", "");
                    }}
                    placeholder={loadingStates ? "Loading states..." : (!country ? "Select Country First" : "Select State")}
                    searchPlaceholder="Search state..."
                    disabled={!country || loadingStates}
                    error={undefined}
                    loading={loadingStates}
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    City {loadingCities && <span className="text-indigo-500 lowercase">(loading...)</span>}
                </label>
                <SearchableSelect
                    value={city || ""}
                    options={cities}
                    onChange={(val) => onChange("city", val)}
                    placeholder={loadingCities ? "Loading cities..." : (!state ? "Select State First" : "Select City")}
                    searchPlaceholder="Search city..."
                    disabled={!state || loadingCities}
                    error={undefined}
                    loading={loadingCities}
                />
            </div>
        </>
    );
}

function SearchableSelect({
    value,
    options,
    onChange,
    placeholder,
    disabled,
    error,
    loading,
    searchPlaceholder = "Search..."
}: {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
    error?: string;
    loading?: boolean;
    searchPlaceholder?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

    const inputClasses = `w-full px-3 py-2 text-left rounded-lg border focus:ring-2 focus:border-transparent transition-all shadow-sm ${error
        ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
        : 'border-gray-300 dark:border-gray-700 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800'
        } text-gray-900 dark:text-white text-sm flex justify-between items-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'}`;

    return (
        <div ref={wrapperRef} className="relative w-full">
            <button
                type="button"
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(!isOpen);
                        if (!isOpen) setSearch(""); // Reset search when opening
                    }
                }}
                disabled={disabled}
                className={inputClasses}
            >
                <span className={value ? "text-gray-900 dark:text-white truncate pr-4" : "text-gray-500 truncate pr-4"}>
                    {loading ? placeholder : (value || placeholder)}
                </span>
                <svg className={`w-4 h-4 transition-transform flex-shrink-0 text-gray-500 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-gray-800/90 backdrop-blur z-10">
                        <input
                            type="text"
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder-gray-400"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>
                    <ul className="overflow-y-auto flex-1 p-1">
                        {filteredOptions.length === 0 ? (
                            <li className="px-3 py-3 text-sm text-gray-400 text-center italic">No results found</li>
                        ) : (
                            filteredOptions.map(opt => (
                                <li
                                    key={opt}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                    }}
                                    className={`px-3 py-2 text-sm rounded cursor-pointer transition-colors ${value === opt ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                                >
                                    {opt}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
