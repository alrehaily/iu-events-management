import {t} from "@lingui/macro";
import {useLingui} from "@lingui/react";
import {Box, Group, NumberInput, Paper, Select, Stack, Text, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useMemo, useState} from "react";
import {IconMapPin} from "@tabler/icons-react";
import {Modal} from "../../common/Modal";
import {Button} from "../../common/Button";
import {InputGroup} from "../../common/InputGroup";
import {AddressAutocomplete} from "../../common/AddressAutocomplete";
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

const hasAnyAddressField = (address: VenueAddress) => [
    address.venue_name,
    address.address_line_1,
    address.city,
    address.state_or_region,
    address.zip_or_postal_code,
    address.country,
].some((value) => (value ?? '').trim().length > 0);

export const LocationEditModal = ({onClose, organizerId, location}: LocationEditModalProps) => {
    const {i18n} = useLingui();
    const isArabic = i18n.locale === 'ar';
    const isEditing = !!location?.id;
    const createMutation = useCreateLocation();
    const updateMutation = useUpdateLocation();
    const formErrorHandle = useFormErrorResponseHandler();
    const isPending = createMutation.isPending || updateMutation.isPending;
    const [latLng, setLatLng] = useState<{lat: number | string; lng: number | string; provider: string | null; placeId: string | null}>({
        lat: location?.latitude ?? "",
        lng: location?.longitude ?? "",
        provider: location?.provider ?? null,
        placeId: location?.provider_place_id ?? null,
    });

    const countryOptions = useMemo(() => {
        return countries.map((c) => ({
            value: c.value,
            label: c.value === SAUDI_COUNTRY
                ? (isArabic ? 'المملكة العربية السعودية (SA)' : 'Saudi Arabia (SA)')
                : c.label,
        })).sort((a, b) => {
            if (a.value === SAUDI_COUNTRY) return -1;
            if (b.value === SAUDI_COUNTRY) return 1;
            return a.label.localeCompare(b.label);
        });
    }, [isArabic]);

    const form = useForm<{name: string; structured_address: VenueAddress}>({
        initialValues: {
            name: location?.name ?? "",
            structured_address: {
                venue_name: location?.structured_address?.venue_name ?? "",
                address_line_1: location?.structured_address?.address_line_1 ?? "",
                address_line_2: location?.structured_address?.address_line_2 ?? "",
                city: location?.structured_address?.city ?? "",
                state_or_region: location?.structured_address?.state_or_region ?? "",
                zip_or_postal_code: location?.structured_address?.zip_or_postal_code ?? "",
                country: location?.structured_address?.country ?? (isEditing ? "" : SAUDI_COUNTRY),
            },
        },
        validate: {
            structured_address: {
                venue_name: (_, values) => hasAnyAddressField(values.structured_address)
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
    };

    const handleSubmit = async (values: {name: string; structured_address: VenueAddress}) => {
        const payload = {
            name: values.name || null,
            structured_address: values.structured_address,
            latitude: typeof latLng.lat === "number" ? latLng.lat : null,
            longitude: typeof latLng.lng === "number" ? latLng.lng : null,
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

    const mapEmbedUrl = typeof latLng.lat === 'number' && typeof latLng.lng === 'number'
        && Math.abs(latLng.lat) <= 90 && Math.abs(latLng.lng) <= 180
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${latLng.lng - 0.006}%2C${latLng.lat - 0.004}%2C${latLng.lng + 0.006}%2C${latLng.lat + 0.004}&layer=mapnik&marker=${latLng.lat}%2C${latLng.lng}`
        : null;

    return (
        <Modal opened onClose={onClose} heading={isEditing ? t`Edit Location` : t`Add Location`} size="lg">
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                    <AddressAutocomplete
                        organizerId={organizerId}
                        country={form.values.structured_address.country || undefined}
                        onPlaceSelected={handlePlaceSelected}
                    />

                    <Paper withBorder p="sm" radius="md" style={{backgroundColor: 'var(--iu-surface-alt, #f8faf9)'}}>
                        <Group justify="space-between" mb="xs">
                            <Group gap="xs">
                                <IconMapPin size={16} color="var(--iu-green-secondary, #1b754b)"/>
                                <Text size="sm" fw={600}>
                                    {t`Coordinates & Map Preview`}
                                </Text>
                            </Group>
                        </Group>
                        <InputGroup>
                            <NumberInput
                                label={t`Latitude`}
                                value={latLng.lat}
                                min={-90}
                                max={90}
                                onChange={(lat) => setLatLng((prev) => ({...prev, lat, provider: null, placeId: null}))}
                            />
                            <NumberInput
                                label={t`Longitude`}
                                value={latLng.lng}
                                min={-180}
                                max={180}
                                onChange={(lng) => setLatLng((prev) => ({...prev, lng, provider: null, placeId: null}))}
                            />
                        </InputGroup>
                        {mapEmbedUrl && (
                            <Box mt="xs" style={{borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--iu-border, #e5e7eb)'}}>
                                <iframe
                                    title={t`Venue Location Map`}
                                    width="100%"
                                    height="180"
                                    loading="lazy"
                                    src={mapEmbedUrl}
                                    style={{display: 'block', border: 'none'}}
                                />
                            </Box>
                        )}
                    </Paper>

                    <TextInput
                        {...form.getInputProps("name")}
                        label={t`Display name`}
                        description={t`Optional nickname shown in pickers, e.g. "HQ Conference Room"`}
                        placeholder={t`Main Office`}
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
                    <Button type="submit" fullWidth mt="md" loading={isPending}>
                        {isEditing ? t`Save Changes` : t`Add Location`}
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
};
