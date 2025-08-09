// 'use client'
//
// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import {
//     APIProvider,
//     Map,
//     AdvancedMarker,
//     InfoWindow,
//     useAdvancedMarkerRef,
//     useMapsLibrary,
// } from '@vis.gl/react-google-maps';
//
// interface GoogleMapComponentProps {
//     onLocationSelected?: (address: string, latitude: number, longitude: number) => void;
//     initialLatitude?: number;
//     initialLongitude?: number;
//     initialAddress?: string;
//     height?: string | number;
//     className?: string;
// }
//
// // Separate component for the map content to access hooks
// const MapContent = ({
//                         onLocationSelected,
//                         initialLatitude,
//                         initialLongitude,
//                         initialAddress = '',
//                         height = '400px',
//                     }: Omit<GoogleMapComponentProps, 'className'>) => {
//     const places = useMapsLibrary('places');
//     const [markerRef, marker] = useAdvancedMarkerRef();
//
//     const [markerPosition, setMarkerPosition] = useState<{
//         lat: number;
//         lng: number;
//         address: string;
//     } | null>(
//         initialLatitude && initialLongitude
//             ? {
//                 lat: initialLatitude,
//                 lng: initialLongitude,
//                 address: initialAddress,
//             }
//             : null
//     );
//     const [showInfoWindow, setShowInfoWindow] = useState(false);
//     const [inputValue, setInputValue] = useState(initialAddress);
//     const inputRef = useRef<HTMLInputElement>(null);
//     const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
//     const mapRef = useRef<google.maps.Map | null>(null);
//
//     const center = {
//         lat: initialLatitude || 37.7749,
//         lng: initialLongitude || -122.4194,
//     };
//
//     // Initialize autocomplete when places library is loaded
//     useEffect(() => {
//         if (!places || !inputRef.current || autocompleteRef.current) return;
//
//         autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
//             fields: ['formatted_address', 'geometry', 'name'],
//         });
//
//         const listener = autocompleteRef.current.addListener('place_changed', () => {
//             const place = autocompleteRef.current?.getPlace();
//             const location = place?.geometry?.location;
//
//             if (location) {
//                 const lat = location.lat();
//                 const lng = location.lng();
//                 const address = place?.formatted_address || place?.name || '';
//
//                 setMarkerPosition({ lat, lng, address });
//                 setInputValue(address);
//                 setShowInfoWindow(false);
//
//                 // Pan and zoom to the selected location
//                 if (mapRef.current) {
//                     mapRef.current.panTo({ lat, lng });
//                     mapRef.current.setZoom(17);
//                 }
//
//                 if (onLocationSelected) {
//                     onLocationSelected(address, lat, lng);
//                 }
//
//                 // Keep the address in the input
//                 if (inputRef.current) {
//                     inputRef.current.value = address;
//                 }
//             }
//         });
//
//         return () => {
//             if (listener) {
//                 google.maps.event.removeListener(listener);
//             }
//         };
//     }, [places, onLocationSelected]);
//
//     // Ensure input value stays synchronized
//     useEffect(() => {
//         if (inputRef.current && inputValue) {
//             inputRef.current.value = inputValue;
//         }
//     }, [inputValue]);
//
//     const handleMapClick = useCallback((event: any) => {
//         // The @vis.gl library passes the native Google Maps event in detail
//         const latLng = event.detail?.latLng;
//         if (!latLng) return;
//
//         const lat = latLng.lat;
//         const lng = latLng.lng;
//
//         // Geocode the coordinates to get an address
//         const geocoder = new google.maps.Geocoder();
//         geocoder.geocode(
//             { location: { lat, lng } },
//             (results, status) => {
//                 if (status === 'OK' && results && results[0]) {
//                     const address = results[0].formatted_address;
//                     setMarkerPosition({ lat, lng, address });
//                     setInputValue(address);
//                     if (inputRef.current) {
//                         inputRef.current.value = address;
//                     }
//                     setShowInfoWindow(false);
//
//                     if (onLocationSelected) {
//                         onLocationSelected(address, lat, lng);
//                     }
//                 } else {
//                     // If geocoding fails, use coordinates as address
//                     const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
//                     setMarkerPosition({ lat, lng, address });
//                     setInputValue(address);
//                     if (inputRef.current) {
//                         inputRef.current.value = address;
//                     }
//                     setShowInfoWindow(false);
//
//                     if (onLocationSelected) {
//                         onLocationSelected(address, lat, lng);
//                     }
//                 }
//             }
//         );
//     }, [onLocationSelected]);
//
//     return (
//         <>
//             <div className="absolute top-2 left-2 z-10">
//                 <input
//                     ref={inputRef}
//                     type="text"
//                     placeholder="Search for a place..."
//                     defaultValue={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     className="w-80 h-10 px-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                 />
//             </div>
//
//             <Map
//                 style={{ width: '100%', height: typeof height === 'string' ? height : `${height}px` }}
//                 defaultCenter={center}
//                 center={markerPosition ? { lat: markerPosition.lat, lng: markerPosition.lng } : undefined}
//                 defaultZoom={13}
//                 zoom={markerPosition ? 17 : undefined}
//                 gestureHandling="greedy"
//                 mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID'}
//                 onClick={handleMapClick}
//                 onCameraChanged={({ map }) => {
//                     mapRef.current = map;
//                 }}
//                 mapTypeControl={false}
//                 fullscreenControl={true}
//                 streetViewControl={true}
//                 zoomControl={true}
//             >
//                 {markerPosition && (
//                     <>
//                         <AdvancedMarker
//                             ref={markerRef}
//                             position={{ lat: markerPosition.lat, lng: markerPosition.lng }}
//                             onClick={() => setShowInfoWindow(true)}
//                         />
//                         {showInfoWindow && marker && (
//                             <InfoWindow
//                                 anchor={marker}
//                                 onCloseClick={() => setShowInfoWindow(false)}
//                             >
//                                 <div className="p-2">
//                                     <div className="font-semibold">Selected Location</div>
//                                     <div className="text-sm text-gray-600">{markerPosition.address}</div>
//                                     <div className="text-xs text-gray-500 mt-1">
//                                         {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
//                                     </div>
//                                 </div>
//                             </InfoWindow>
//                         )}
//                     </>
//                 )}
//             </Map>
//
//             {markerPosition && (
//                 <div className="absolute bottom-2 left-2 bg-white px-3 py-1 rounded shadow text-sm text-gray-600">
//                     Coordinates: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
//                 </div>
//             )}
//         </>
//     );
// };
//
// const GoogleMapComponent = ({
//                                 onLocationSelected,
//                                 initialLatitude,
//                                 initialLongitude,
//                                 initialAddress = '',
//                                 height = '400px',
//                                 className = '',
//                             }: GoogleMapComponentProps) => {
//     return (
//         <APIProvider
//             apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
//             libraries={['places']}
//         >
//             <div className={`relative ${className}`}>
//                 <MapContent
//                     onLocationSelected={onLocationSelected}
//                     initialLatitude={initialLatitude}
//                     initialLongitude={initialLongitude}
//                     initialAddress={initialAddress}
//                     height={height}
//                 />
//             </div>
//         </APIProvider>
//     );
// };
//
