import {APIProvider, Map} from "@vis.gl/react-google-maps";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID as string;

const googleMap2 = () => {

    return(
            <APIProvider apiKey={API_KEY}>
                <Map
                    defaultZoom={3}
                    defaultCenter={{ lat: -7.5, lng: -7.5 }}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                />
            </APIProvider>
        )
}

export default googleMap2