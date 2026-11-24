import {t} from "@lingui/macro";
import {useLingui} from "@lingui/react";
import {Badge, Collapse, Group, NumberInput, Paper, Select, Stack, Text, TextInput} from "@mantine/core";
import {IconCheck, IconChevronDown, IconChevronUp, IconMapPin} from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import {useMemo, useState} from "react";
import {Modal} from "../../common/Modal";
import {Button} from "../../common/Button";
import {InputGroup} from "../../common/InputGroup";
import {AddressAutocomplete} from "../../common/AddressAutocomplete";
import {VenueMapPicker} from "../../common/VenueMapPicker";
import {SAUDI_COUNTRY} from "../../../constants/institution.ts";
import countries from "../../../../data/countries.json";
import {GeoPlace, IdParam, Location, VenueAddress} from "../../../types.ts";
import {useCreateLocation} from "../../../mutations/useCreateLocation.ts";
import {useUpdateLocation} from "../../../mutations/useUpdateLocation.ts";
import {showError, showSuccess} from "../../../utilites/notifications.tsx";
import {useFormErrorResponseHandler} from "../../../hooks/useFormErrorResponseHandler.tsx";

interface LocationEditModalProps {
    onClose: () => void;
    organizerId: IdParam;
    location: Location | null;
}

const hasAnyAddressField = (address: VenueAddress, name?: string) => [
    name,
    address.venue_name,
    address.address_line_1,
    address.city,
    address.state_or_region,
    address.zip_or_postal_code,
    address.country,
].some((value) => (value ?? '').trim().length > 0);

export const LocationEditModal = ({onClose, organizerId, location}: LocationEditModalProps) => {
    const {i18n} = useLingui();
    const locale = i18n.locale;
    const isEditing = !!location?.id;
    const createMutation = useCreateLocation();
    const updateMutation = useUpdateLocation();
    const formErrorHandle = useFormErrorResponseHandler();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const [showManualDetails, setShowManualDetails] = useState<boolean>(isEditing || false);
    const [latLng, setLatLng] = useState<{lat: number | string; lng: number | string; provider: string | null; placeId: string | null}>({
        lat: location?.latitude ?? "",
        lng: location?.longitude ?? "",
        provider: location?.provider ?? null,
        placeId: location?.provider_place_id ?? null,
    });

    const countryOptions = useMemo(() => {
        let regions: Intl.DisplayNames | null = null;
        try {
            regions = new Intl.DisplayNames([locale], {type: 'region'});
        } catch {
            regions = null;
        }

        return countries
            .filter((c) => Boolean(c.value && c.value.trim()))
            .map((c) => {
                let localizedName = c.label;
                if (regions && c.value) {
                    try {
                        localizedName = regions.of(c.value) ?? c.label;
                    } catch {
                        localizedName = c.label;
                    }
                }
                return {
                    value: c.value,
                    label: c.value === SAUDI_COUNTRY
                        ? (locale === 'ar' ? 'المملكة العربية السعودية (SA)' : 'Saudi Arabia (SA)')
                        : `${localizedName} (${c.value})`,
                };
            })
            .sort((a, b) => {
                if (a.value === SAUDI_COUNTRY) return -1;
                if (b.value === SAUDI_COUNTRY) return 1;
                return a.label.localeCompare(b.label, locale);
            });
    }, [locale]);

    const point = useMemo(() => (
        typeof latLng.lat === 'number' && typeof latLng.lng === 'number'
        && Math.abs(latLng.lat) <= 90 && Math.abs(latLng.lng) <= 180
            ? {lat: latLng.lat, lng: latLng.lng} : null
    ), [latLng.lat, latLng.lng]);
    const [coordinateError, setCoordinateError] = useState(false);

    const form = useForm<{name: string; structured_address: VenueAddress}>({
        initialValues: {
            name: location?.name ?? "",
            structured_address: {
                venue_name: location?.structured_address?.venue_name ?? "",
                address_line_1: location?.structured_address?.address_line_1 ?? "",
                address_line_2: location?.structured_address?.address_line_2 ?? "",
                city: location?.structured_address?.city ?? (isEditing ? "" : "المدينة المنورة"),
                state_or_region: location?.structured_address?.state_or_region ?? (isEditing ? "" : "منطقة المدينة المنورة"),
                zip_or_postal_code: location?.structured_address?.zip_or_postal_code ?? "",
                country: location?.structured_address?.country ?? (isEditing ? "" : SAUDI_COUNTRY),
            },
        },
        validate: {
            name: (value, values) => {
                if (!value?.trim() && !values.structured_address.venue_name?.trim() && !point) {
                    return t`Please provide a location name or pick a point on the map.`;
                }
                return null;
            },
            structured_address: {
                venue_name: (_, values) => (hasAnyAddressField(values.structured_address, values.name) || point)
                    ? null
                    : t`Provide at least one address field (venue, street, city, or country).`,
            },
        },
    });

    const handlePlaceSelected = (place: GeoPlace) => {
        form.setValues({
            name: place.display_name ?? place.address.venue_name ?? form.values.name,
            structured_address: {
                venue_name: place.address.venue_name ?? "",
                address_line_1: place.address.address_line_1 ?? "",
                address_line_2: place.address.address_line_2 ?? "",
                city: place.address.city ?? "",
                state_or_region: place.address.state_or_region ?? "",
                zip_or_postal_code: place.address.zip_or_postal_code ?? "",
                country: place.address.country ?? "",
            },
        });
        form.clearErrors();
        setLatLng({
            lat: place.latitude ?? "",
            lng: place.longitude ?? "",
            provider: place.provider,
            placeId: place.provider_place_id,
        });
        setShowManualDetails(true);
    };

    const handleSubmit = async (values: {name: string; structured_address: VenueAddress}) => {
        if ((latLng.lat !== '' || latLng.lng !== '') && !point) {
            setCoordinateError(true);
            return;
        }

        const venueName = values.structured_address?.venue_name?.trim() || "";
        const fallbackName = values.name.trim() || venueName || t`University Venue`;
        const payload = {
            name: values.name.trim() || fallbackName,
            structured_address: {
                ...values.structured_address,
                venue_name: venueName || fallbackName,
                city: values.structured_address?.city?.trim() || "المدينة المنورة",
                country: values.structured_address?.country?.trim() || SAUDI_COUNTRY,
            },
            latitude: point?.lat ?? null,
            longitude: point?.lng ?? null,
            provider: latLng.provider,
            provider_place_id: latLng.placeId,
        };

        try {
            if (isEditing && location?.id) {
                await updateMutation.mutateAsync({organizerId, locationId: location.id, payload});
                showSuccess(t`Location updated`);
            } else {
                await createMutation.mutateAsync({organizerId, payload});
                showSuccess(t`Location saved`);
            }
            onClose();
        } catch (error: any) {
            if (error?.response?.status === 409 && error?.response?.data?.message) {
                showError(error.response.data.message);
                return;
            }

            formErrorHandle(form, error);

            const addressError = error?.response?.data?.errors?.structured_address;
            if (addressError) {
                form.setFieldError(
                    'structured_address.venue_name',
                    Array.isArray(addressError) ? addressError[0] : addressError,
                );
            }
        }
    };

    return (
        <Modal opened onClose={onClose} heading={isEditing ? t`Edit Location` : t`Add Location`} size="lg">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    {/* 1. Map section displayed first as requested */}
                    <Paper withBorder p="xs" radius="md">
                        <VenueMapPicker point={point} onSelect={selected => {
                            setLatLng({...selected, provider: null, placeId: null});
                            setCoordinateError(false);
                            if (!form.values.name && !form.values.structured_address.venue_name) {
                                form.setFieldValue("name", "مقر الجامعة الإسلامية");
                                form.setFieldValue("structured_address.venue_name", "مقر الجامعة الإسلامية");
                            }
                        }}/>
                    </Paper>

                    <Group justify="space-between" align="center" px="xs">
                        <Group gap="xs">
                            <IconMapPin size={16} color="var(--iu-green-primary, #084b2f)"/>
                            <Text size="xs" fw={600} c="dimmed">
                                {point
                                    ? `${t`Selected Coordinates:`} ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
                                    : t`Click the map to place a pin, or enter details below.`}
                            </Text>
                        </Group>
                        {point && (
                            <Badge color="green" variant="light" size="sm" leftSection={<IconCheck size={12}/>}>
                                {t`Location pinned`}
                            </Badge>
                        )}
                    </Group>

                    {/* 2. Main Location / Venue Name input */}
                    <TextInput
                        {...form.getInputProps("name")}
                        label={t`Location / Venue Name`}
                        description={t`Name of the hall, auditorium, or location (e.g. Conference Center, Hall 1).`}
                        placeholder={t`e.g., Main University Auditorium`}
                        required
                    />

                    {/* 3. Button to toggle manual address details */}
                    <Button
                        type="button"
                        variant="subtle"
                        color="gray"
                        leftSection={showManualDetails ? <IconChevronUp size={16}/> : <IconChevronDown size={16}/>}
                        onClick={() => setShowManualDetails(!showManualDetails)}
                        fullWidth
                    >
                        {showManualDetails ? t`Hide manual address details` : t`Add address details manually (Street, City, Postal Code)`}
                    </Button>

                    {/* 4. Collapsible manual fields */}
                    <Collapse expanded={showManualDetails}>
                        <Stack gap="sm" pt="xs">
                            <AddressAutocomplete
                                organizerId={organizerId}
                                country={form.values.structured_address.country || undefined}
                                onPlaceSelected={handlePlaceSelected}
                            />

                            <TextInput
                                {...form.getInputProps("structured_address.venue_name")}
                                label={t`Venue Name`}
                                placeholder={t`Conference Center`}
                            />
                            <InputGroup>
                                <TextInput {...form.getInputProps("structured_address.address_line_1")} label={t`Address Line 1`}/>
                                <TextInput {...form.getInputProps("structured_address.address_line_2")} label={t`Address Line 2`}/>
                            </InputGroup>
                            <InputGroup>
                                <TextInput {...form.getInputProps("structured_address.city")} label={t`City`}/>
                                <TextInput {...form.getInputProps("structured_address.state_or_region")} label={t`State or Region`}/>
                            </InputGroup>
                            <InputGroup>
                                <TextInput {...form.getInputProps("structured_address.zip_or_postal_code")} label={t`Zip or Postal Code`}/>
                                <Select
                                    searchable
                                    data={countryOptions}
                                    {...form.getInputProps("structured_address.country")}
                                    label={t`Country`}
                                    placeholder={t`Saudi Arabia`}
                                />
                            </InputGroup>

                            <details open={coordinateError || undefined}>
                                <summary>{t`Advanced coordinates (optional)`}</summary>
                                <InputGroup>
                                    <NumberInput
                                        label={t`Latitude`}
                                        value={latLng.lat}
                                        min={-90}
                                        max={90}
                                        decimalScale={7}
                                        onChange={(lat) => setLatLng((prev) => ({...prev, lat, provider: null, placeId: null}))}
                                    />
                                    <NumberInput
                                        label={t`Longitude`}
                                        value={latLng.lng}
                                        min={-180}
                                        max={180}
                                        decimalScale={7}
                                        onChange={(lng) => setLatLng((prev) => ({...prev, lng, provider: null, placeId: null}))}
                                    />
                                </InputGroup>
                                {coordinateError && !point && (
                                    <Text role="alert" size="sm" c="red">{t`Enter a valid latitude and longitude, or leave both blank.`}</Text>
                                )}
                            </details>
                        </Stack>
                    </Collapse>

                    {/* 5. Save Button */}
                    <Button type="submit" fullWidth mt="md" loading={isPending} color="green">
                        {isEditing ? t`Save Changes` : t`Add Location`}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};
