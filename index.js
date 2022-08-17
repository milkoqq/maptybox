// Global Variables
let map;
let mapRoute = []
let currentMarkers = []
let geojson;


// Get User Coords
const getPosition = function () {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject);

    });
};


// Get Map with position coords.
const loadMap = function (lng, lat) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWlsa29xcSIsImEiOiJjbDZtZTY3encwMzM3M2JubDFncjgzM2x1In0.LnjZPWDRE_YiImykL9OeMw';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lng, lat], // starting position
        zoom: 15
    });

}

let isShowingRoute = false;

async function showRoute(start, end) {
    isShowingRoute = true;
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;
    console.log(`${(data.distance / 1000).toFixed(2)} km Distance`)
    geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: route
        }
    };
    // if the route already exists on the map, reset it
    if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
    }
    // otherwise, make a new request
    else {
        map.addLayer({
            id: 'route', //can take whatever name
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
            }
        });
    }
}




const init = async () => {
    try {
        //Getting user's init position
        const pos = await getPosition()
        const { latitude: lat, longitude: lng } = pos.coords
        loadMap(lng, lat)

        // Getting Map clicks positions.
        map.on('click', (e) => {

            if (mapRoute.length > 1) {
                return
            }

            mapRoute.push([e.lngLat.lng, e.lngLat.lat])

            // Set marker options.
            let marker = new mapboxgl.Marker({
                color: "#000000",
                draggable: false
            })
                .setLngLat([e.lngLat.lng, e.lngLat.lat])
                .addTo(map);

            currentMarkers.push(marker)

            if (mapRoute.length === 2) showRoute(mapRoute[0], mapRoute[1])



        })

    }
    catch (e) {
        console.log(e)
    }
}

init()
