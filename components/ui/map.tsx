import React from 'react'
import dynamic from 'next/dynamic'

//dynamically import the components to avoid server side rendering and only render on the client side
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false })

interface MapProps {
    latitude: number;
    longitude: number;
    markerText?: string;
    height?: string | number;
}

const Map: React.FC<MapProps> = ({
latitude,
longitude,
markerText = 'Location',
height = 400
}) => {
    const position: [number, number] = [latitude, longitude]

    return (
        <div className={`w-full h-${height}`}>
            <MapContainer center={position} zoom={13} className='h-full w-full'>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>{markerText}</Popup>
                </Marker>
            </MapContainer>
        </div>

    )
}

export default Map;