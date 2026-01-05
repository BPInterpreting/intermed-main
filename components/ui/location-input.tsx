import React, {useState} from 'react';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

interface Suggestion {
    display_name: string
    lat: string
    lon: string
}

interface LocationInputProps {
    initialAddress?: string
    onLocationSelected: (address: string, latitude: number, longitude: number) => void
}

async function geocodeAddress(address: string):Promise<Suggestion[]> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5`
    try{
        const response = await fetch(url,
            {
                headers: {
                    'User-Agent': 'InterpreFi/1.0 (bpena707@icloud.com)'
                }
            })
        const data = await response.json()
        console.log('fetched location suggestions', data)
        return data
    } catch (e) {
        console.error(e)
        return []
    }

}

const LocationInput: React.FC<LocationInputProps> = ({
initialAddress = '',
onLocationSelected
}) => {
    const [address, setAddress] = useState(initialAddress)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])

    const handleSearch = async () => {
        if (!address.trim()) {
            setError('Address is required');
            return;
        }
        setError(null);
        setLoading(true);
        const results = await geocodeAddress(address);
        setLoading(false);
        if (results.length > 0) {
            setSuggestions(results);
        } else {
            setError('Address not found. Check the address and try again.');
        }
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        console.log('selected suggestion', suggestion)
        setAddress(suggestion.display_name)
        setSuggestions([])
        onLocationSelected(
            suggestion.display_name,
            parseFloat(suggestion.lat),
            parseFloat(suggestion.lon)
        )
    }

    return (
        <div className='flex flex-col items-center relative'>
            <Input
                type='text'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder='123 Main St, City, State, ZIP'
                className='w-full'
            />
            <Button
                onClick={handleSearch}
                className='bg-blue-500 text-white absolute right-0 top-1/2 transform -translate-y-1/2 rounded-s-sm'
                disabled={loading}
            >
                Search
            </Button>
            {loading && <p className='text-blue-500'>Loading...</p>}
            {error && <p className='text-red-500'>{error}</p>}
            {suggestions.length > 0 && (
                <ul
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        zIndex: 1000,
                        border: '1px solid #ccc',
                        maxHeight: '200px',
                        overflowY: 'auto',
                    }}
                >
                    {suggestions.map((s, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(s)}
                            className='cursor-pointer hover:bg-gray-100'
                        >
                            {s.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default LocationInput;