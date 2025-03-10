import React from 'react';
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";


interface LocationInputProps {
    initialAddress?: string
    onLocationSelected: (address: string, latitude: number, longitude: number) => void
}

async function geocodeAddress(address: string):Promise<{latitude: number, longitude: number} | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    try{
        const response = await fetch(url,
            {
                headers: {
                    'User-Agent': 'Intermed/1.0 (bpena707@icloud.com)'
                }
            })
        const data = await response.json()
        if (data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon)
            }
        }
        return null

    } catch (e) {
        console.error(e)
        return null
    }

}

const LocationInput: React.FC<LocationInputProps> = ({
initialAddress = '',
onLocationSelected
}) => {
    const [address, setAddress] = React.useState(initialAddress)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleSearch = async () => {
        if (!address) {
            setError('Address is required')
            return
        }
        setError(null)
        setLoading(true)
        const coords = await geocodeAddress(address)
        setLoading(false)
        if (coords) {
            onLocationSelected(address!, coords.latitude, coords.longitude)
        } else {
            setError('Address not found. Check the address and try again.')
        }
    }

    return (
        <div className='flex flex-col items-center'>
            <Input
                type='text'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder='123 Main St, City, State, ZIP'
            />
            <Button
                onClick={handleSearch}
                className='bg-blue-500 text-white rounded p-2 mt-2'
                disabled={loading}
            >
                Search
            </Button>
            {loading ? 'Finding location...' : 'Find Location'}
            {error && <p className='text-red-500'>{error}</p>}
        </div>
    )
}

export default LocationInput;