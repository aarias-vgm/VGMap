/**
 * Degrees into radians
 * @param {number} degrees 
 * @returns {number}
 */
function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Calculate geographic distance (km) between 2 points using Haversine formula
 * @param {{lat: number, lng: number}} coords1
 * @param {{lat: number, lng: number}} coords2
 * @returns {number}
 */
function calculateKmDistance(coords1, coords2) {
    const earthRadiusKm = 6371;

    const lat1Rad = degreesToRadians(coords1.lat);
    const lat2Rad = degreesToRadians(coords2.lat);

    const latDistanceRad = degreesToRadians(coords1.lat - coords2.lat);
    const lngDistanceRad = degreesToRadians(coords1.lng - coords2.lng);

    const sinHalfDistanceLat = Math.sin(latDistanceRad / 2);
    const sinHalfDistanceLng = Math.sin(lngDistanceRad / 2);

    const haversineTerm = (sinHalfDistanceLat * sinHalfDistanceLat) + (Math.cos(lat1Rad) * Math.cos(lat2Rad)) * (sinHalfDistanceLng * sinHalfDistanceLng)

    const centralAngleRad = 2 * Math.atan2(Math.sqrt(haversineTerm), Math.sqrt(1 - haversineTerm));

    return earthRadiusKm * centralAngleRad;
}

const Haversine = {
    calculateKmDistance: calculateKmDistance
}

export default Haversine