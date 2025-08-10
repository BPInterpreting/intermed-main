'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
    APIProvider,
    Map,
    AdvancedMarker,
    InfoWindow,
    useAdvancedMarkerRef,
    useMap,
} from '@vis.gl/react-google-maps';

interface GoogleMapComponentProps {
    onLocationSelected?: (address: string, latitude: number, longitude: number) => void;
    initialLatitude?: number;
    initialLongitude?: number;
    initialAddress?: string;
    height?: string | number;
    className?: string;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'gmp-place-autocomplete': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
        }
    }
}

// CRITICAL: MapContent must be a separate component to use the useMap hook
// This component runs INSIDE the Map context and has access to the map instance
const MapContent = ({
                        onLocationSelected,
                        initialLatitude,
                        initialLongitude,
                        initialAddress,
                        height,
                    }: Omit<GoogleMapComponentProps, 'className'>) => {


    // CRITICAL: useMap() hook gives us direct access to the Google Maps instance
    // This can ONLY be used inside a component that's a child of <Map>
    const map = useMap();

    // Advanced marker with ref for InfoWindow anchoring
    const [markerRef, marker] = useAdvancedMarkerRef();
    const [showInfoWindow, setShowInfoWindow] = useState(false);
    const [markerPosition, setMarkerPosition] = useState<{
        lat: number;
        lng: number;
        address: string;
    } | null>(
        initialLatitude && initialLongitude
            ? {
                lat: initialLatitude,
                lng: initialLongitude,
                address: initialAddress || '',
            }
            : null
    );

    const autocompleteRef = useRef<HTMLElement>(null);

    // Handle autocomplete selection
    useEffect(() => {
        const el = autocompleteRef.current as any;
        if (!el) return;

        const handler = async (ev: any) => {
            try {
                let place;
                // Handle different API versions (placePrediction vs place)
                if (ev.placePrediction) {
                    place = await ev.placePrediction.toPlace();
                    await place.fetchFields({
                        fields: ['displayName', 'formattedAddress', 'location'],
                    });
                } else if (ev.place) {
                    place = ev.place;
                }

                if (place?.location) {
                    // Handle both function and property formats for lat/lng
                    const lat = typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
                    const lng = typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
                    const address = place.formattedAddress || place.displayName || '';

                    // Update marker position
                    setMarkerPosition({ lat, lng, address });
                    setShowInfoWindow(false);

                    // CRITICAL: Use map instance methods instead of props to control the map
                    // This avoids re-render loops and maintains smooth interaction
                    if (map) {
                        map.panTo({ lat, lng });  // Smoothly pan to location
                        map.setZoom(17);          // Zoom in to show detail
                    }

                    if (onLocationSelected) {
                        onLocationSelected(address, lat, lng);
                    }
                }
            } catch (error) {
                console.error('Error handling place selection:', error);
            }
        };

        // Listen for both event names (different versions use different names)
        el.addEventListener('gmp-select', handler);
        el.addEventListener('gmp-placeselect', handler);

        return () => {
            el.removeEventListener('gmp-select', handler);
            el.removeEventListener('gmp-placeselect', handler);
        };
    }, [onLocationSelected, map]); // Include map in dependencies

    // Handle map clicks to place markers
    const handleMapClick = (event: any) => {
        const latLng = event.detail?.latLng;
        if (!latLng) return;

        const lat = latLng.lat;
        const lng = latLng.lng;

        // Reverse geocode to get address from coordinates
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
            { location: { lat, lng } },
            (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const address = results[0].formatted_address;
                    setMarkerPosition({ lat, lng, address });
                    setShowInfoWindow(false);

                    if (onLocationSelected) {
                        onLocationSelected(address, lat, lng);
                    }
                } else {
                    // Fallback: use coordinates as address
                    const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    setMarkerPosition({ lat, lng, address });
                    setShowInfoWindow(false);

                    if (onLocationSelected) {
                        onLocationSelected(address, lat, lng);
                    }
                }
            }
        );
    };

    // IMPORTANT: All UI elements are rendered inside the Map component
    // This ensures they have access to the map context
    return (
        <>
            {/* Search input - positioned absolutely over the map */}
            <div
                className="absolute top-2 left-2 z-50 w-80"
                style={{
                    WebkitTransform: 'translateZ(0)',
                    transform: 'translateZ(0)',
                    position: 'absolute'
                }}
            >
                <gmp-place-autocomplete ref={autocompleteRef} />
            </div>

            {/* Marker with InfoWindow */}
            {markerPosition && (
                <>
                    <AdvancedMarker
                        ref={markerRef}
                        position={{ lat: markerPosition.lat, lng: markerPosition.lng }}
                        onClick={() => setShowInfoWindow(true)}
                    />
                    {showInfoWindow && marker && (
                        <InfoWindow
                            anchor={marker}  // Anchors to the marker ref
                            onCloseClick={() => setShowInfoWindow(false)}
                        >
                            <div className="p-2">
                                <div className="font-semibold">Selected Location</div>
                                <div className="text-sm text-gray-600">{markerPosition.address}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                                </div>
                            </div>
                        </InfoWindow>
                    )}
                </>
            )}

            {/* Coordinates display */}
            {markerPosition && (
                <div className="absolute bottom-2 left-2 bg-white px-3 py-1 rounded shadow text-sm text-gray-600">
                    Coordinates: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                </div>
            )}
        </>
    );
};

// Main component - sets up the Map provider and context
const GoogleMapComponent = ({
                                onLocationSelected,
                                initialLatitude,
                                initialLongitude,
                                initialAddress = '',
                                height = '400px',
                                className = '',
                            }: GoogleMapComponentProps) => {

    const center = {
        lat: initialLatitude || 37.7749,
        lng: initialLongitude || -122.4194,
    };

    // Add global styles for the web component autocomplete
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            gmp-place-autocomplete {
                width: 100%;
                height: 40px;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                font-size: 14px;
                display: block;
                background: white !important;
                opacity: 1 !important;
                visibility: visible !important;
                -webkit-appearance: none;
                position: relative;
                z-index: 10;
            }
            gmp-place-autocomplete:focus-within {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            gmp-place-autocomplete input {
                width: 100%;
                height: 100%;
                border: none;
                outline: none;
                background: transparent;
                font-size: 14px;
                -webkit-appearance: none;
            }
            // /* Safari-specific fixes for Google Maps controls */
            // .gm-control-container,
            // .gm-control-container > div {
            //     opacity: 1 !important;
            //     visibility: visible !important;
            //     -webkit-transform: translateZ(0);
            //     transform: translateZ(0);
            // }
            // .gm-svpc,
            // .gm-svpc > div {
            //     opacity: 1 !important;
            //     visibility: visible !important;
            //     -webkit-transform: translateZ(0);
            //     transform: translateZ(0);
            // }
            // /* Force hardware acceleration for Safari */
            // .gm-style {
            //     -webkit-transform: translateZ(0);
            //     transform: translateZ(0);
            // }
            // /* Fix for Safari z-index stacking */
            // .gm-style > div:first-child {
            //     z-index: auto !important;
            // }
        `;
        document.head.appendChild(style);

        return () => {
            const styles = document.querySelectorAll('style');
            styles.forEach(s => {
                if (s.innerHTML.includes('gmp-place-autocomplete')) {
                    s.remove();
                }
            });
        };
    }, []);


    return (

        // APIProvider wraps everything and provides Google Maps API access
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places', 'marker']}>
            <div className={`relative ${className}`}>
                {/* CRITICAL: Map component with only DEFAULT props, not controlled props */}
                {/* Using defaultCenter/defaultZoom instead of center/zoom prevents re-render loops */}
                <Map
                    style={{ width: '100%', height: typeof height === 'string' ? height : `${height}px` }}
                    defaultCenter={center}  // Sets initial position only
                    defaultZoom={13}        // Sets initial zoom only
                    mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID!}
                    mapTypeControl={false}
                    fullscreenControl={true}
                    streetViewControl={true}  // Disabled to prevent crashes with AdvancedMarker
                    zoomControl={true}
                    mapTypeId={'hybrid'}


                >
                    {/* CRITICAL: MapContent is rendered INSIDE Map so it can use useMap() hook */}
                    <MapContent
                        onLocationSelected={onLocationSelected}
                        initialLatitude={initialLatitude}
                        initialLongitude={initialLongitude}
                        initialAddress={initialAddress}
                        height={height}
                    />
                </Map>
            </div>

        </APIProvider>
    );
};

export default GoogleMapComponent;