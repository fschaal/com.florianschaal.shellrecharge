export class GeoHelper {
    private degreeToRadius = (degree: number) => {
        return degree * (Math.PI / 180);
    };

    private radiusToDegree = (radius: number) => {
        return (180 * radius) / Math.PI;
    };

    public getBoundingBox(fsLatitude: number, fsLongitude: number, fiDistanceInKM: number){

        if (fiDistanceInKM == null || fiDistanceInKM == 0)
            fiDistanceInKM = 1;

        let MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, ldEarthRadius, ldDistanceInRadius, lsLatitudeInDegree,
            lsLongitudeInDegree,
            lsLatitudeInRadius, lsLongitudeInRadius, lsMinLatitude, lsMaxLatitude, lsMinLongitude, lsMaxLongitude,
            deltaLon;

        // coordinate limits
        MIN_LAT = this.degreeToRadius(-90);
        MAX_LAT = this.degreeToRadius(90);
        MIN_LON = this.degreeToRadius(-180);
        MAX_LON = this.degreeToRadius(180);

        // Earth's radius (km)
        ldEarthRadius = 6378.1;

        // angular distance in radians on a great circle
        ldDistanceInRadius = fiDistanceInKM / ldEarthRadius;

        // center point coordinates (deg)
        lsLatitudeInDegree = fsLatitude;
        lsLongitudeInDegree = fsLongitude;

        // center point coordinates (rad)
        lsLatitudeInRadius = this.degreeToRadius(lsLatitudeInDegree)
        lsLongitudeInRadius = this.degreeToRadius(lsLongitudeInDegree)

        // minimum and maximum latitudes for given distance
        lsMinLatitude = lsLatitudeInRadius - ldDistanceInRadius;
        lsMaxLatitude = lsLatitudeInRadius + ldDistanceInRadius;

        // minimum and maximum longitudes for given distance
        lsMinLongitude = void 0;
        lsMaxLongitude = void 0;

        // define deltaLon to help determine min and max longitudes
        deltaLon = Math.asin(Math.sin(ldDistanceInRadius) / Math.cos(lsLatitudeInRadius));

        if (lsMinLatitude > MIN_LAT && lsMaxLatitude < MAX_LAT) {
            lsMinLongitude = lsLongitudeInRadius - deltaLon;
            lsMaxLongitude = lsLongitudeInRadius + deltaLon;
            if (lsMinLongitude < MIN_LON) {
                lsMinLongitude = lsMinLongitude + 2 * Math.PI;
            }
            if (lsMaxLongitude > MAX_LON) {
                lsMaxLongitude = lsMaxLongitude - 2 * Math.PI;
            }
        }

        // a pole is within the given distance
        else {
            lsMinLatitude = Math.max(lsMinLatitude, MIN_LAT);
            lsMaxLatitude = Math.min(lsMaxLatitude, MAX_LAT);
            lsMinLongitude = MIN_LON;
            lsMaxLongitude = MAX_LON;
        }

        return [
            this.radiusToDegree(lsMinLatitude),
            this.radiusToDegree(lsMinLongitude),
            this.radiusToDegree(lsMaxLatitude),
            this.radiusToDegree(lsMaxLongitude)
        ];
    };
}
