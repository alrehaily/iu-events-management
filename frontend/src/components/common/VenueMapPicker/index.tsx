import {useEffect, useId, useRef, useState} from "react";
import {Button, Group, Text} from "@mantine/core";
import {t} from "@lingui/macro";
import type {CircleMarker, Map} from "leaflet";
import "leaflet/dist/leaflet.css";
import classes from "./VenueMapPicker.module.scss";

export interface VenuePoint {
    lat: number;
    lng: number;
}

const campus: VenuePoint = {lat: 24.4848, lng: 39.5518};

export const VenueMapPicker = ({point, onSelect}: {
    point: VenuePoint | null;
    onSelect: (point: VenuePoint) => void;
}) => {
    const container = useRef<HTMLDivElement>(null);
    const centerButton = useId();
    const [map, setMap] = useState<Map | null>(null);
    const marker = useRef<CircleMarker | null>(null);
    const initialPoint = useRef(point ?? campus);
    const [mapFailed, setMapFailed] = useState(false);
    const [tilesFailed, setTilesFailed] = useState(false);
    const zoomInTitle = t`Zoom in`;
    const zoomOutTitle = t`Zoom out`;

    useEffect(() => {
        let active = true;
        let instance: Map | undefined;
        let resize: ResizeObserver | undefined;

        void import("leaflet").then(leaflet => {
            if (!active || !container.current) return;
            instance = leaflet.map(container.current, {
                center: initialPoint.current,
                zoom: 16,
                maxZoom: 19,
                scrollWheelZoom: false,
                zoomControl: false,
            });
            marker.current = leaflet.circleMarker(initialPoint.current, {
                radius: 9,
                color: '#fff',
                weight: 3,
                fillColor: '#084b2f',
                fillOpacity: 1,
                interactive: false,
            });
            let loadedTiles = 0;
            leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).on('tileloadstart', () => {
                if (!loadedTiles) setTilesFailed(false);
            }).on('tileload', () => {
                loadedTiles++;
                setTilesFailed(false);
            }).on('tileerror', () => {
                if (!loadedTiles) setTilesFailed(true);
            }).addTo(instance);
            resize = new ResizeObserver(() => instance?.invalidateSize({pan: false}));
            resize.observe(container.current);
            setMap(instance);
        }).catch(() => {
            if (active) setMapFailed(true);
        });

        return () => {
            active = false;
            resize?.disconnect();
            instance?.remove();
            marker.current = null;
        };
    }, []);

    useEffect(() => {
        if (!map) return;
        let removeZoomControl: (() => void) | undefined;
        let active = true;
        void import("leaflet").then(leaflet => {
            if (!active) return;
            const zoomControl = leaflet.control.zoom({zoomInTitle, zoomOutTitle}).addTo(map);
            removeZoomControl = () => zoomControl.remove();
        });
        return () => {
            active = false;
            removeZoomControl?.();
        };
    }, [map, zoomInTitle, zoomOutTitle]);

    useEffect(() => {
        if (!map || !marker.current) return;
        if (!point) {
            marker.current.remove();
            return;
        }
        marker.current.setLatLng(point).addTo(map);
        if (!map.getBounds().contains(point)) map.panTo(point);
    }, [map, point]);

    useEffect(() => {
        if (!map) return;
        const pick = ({latlng}: {latlng: VenuePoint}) => {
            const {lat, lng} = map.wrapLatLng(latlng);
            onSelect({lat, lng});
        };
        map.on('click', pick);
        return () => { map.off('click', pick); };
    }, [map, onSelect]);

    return (
        <>
            <Text id={centerButton} size="sm" mb="xs">{t`Click the map to place a marker, or move the map with the arrow keys and select its center.`}</Text>
            <div
                ref={container}
                className={classes.map}
                role="region"
                aria-label={t`Venue Location Map`}
                aria-describedby={centerButton}
                data-testid="venue-map"
                dir="ltr"
            />
            <Group mt="xs" justify="space-between">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!map}
                    onClick={() => {
                        if (!map) return;
                        const {lat, lng} = map.wrapLatLng(map.getCenter());
                        onSelect({lat, lng});
                    }}
                >
                    {t`Select map center`}
                </Button>
                {(mapFailed || tilesFailed) && (
                    <Text role="status" size="sm">{t`The map could not load. You can enter the address and coordinates manually.`}</Text>
                )}
            </Group>
        </>
    );
};
