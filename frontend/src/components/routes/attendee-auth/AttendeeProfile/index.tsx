import {Alert, Button, Container, Paper, Stack, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {t} from "@lingui/macro";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Link, useNavigate, useSearchParams} from "react-router";
import {useEffect} from "react";
import {attendeeClient} from "../../../../api/attendee.client.ts";
import {LoadingMask} from "../../../common/LoadingMask";
import {showError, showSuccess} from "../../../../utilites/notifications.tsx";
import {useIULanguage} from "../../../../context/IULanguageContext.tsx";

const AttendeeProfile = () => {
    useIULanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const requestedReturn = searchParams.get('returnTo');
    const returnTo = requestedReturn && /^\/checkout\/\d+\/[\w-]+\/details\/?$/.test(requestedReturn)
        ? requestedReturn : '/my-registrations';
    const profile = useQuery({
        queryKey: ['attendee-profile'],
        queryFn: () => attendeeClient.me(),
        enabled: typeof window !== 'undefined',
    });
    const form = useForm({
        initialValues: {first_name: '', last_name: ''},
        validate: {
            first_name: value => value.trim() ? null : t`First name is required`,
            last_name: value => value.trim() ? null : t`Last name is required`,
        },
        transformValues: values => ({first_name: values.first_name.trim(), last_name: values.last_name.trim()}),
    });
    useEffect(() => {
        if (profile.data?.user) {
            const {first_name, last_name} = profile.data.user;
            form.setValues({first_name: first_name ?? '', last_name: last_name ?? ''});
        }
    }, [profile.data]);

    const updateName = useMutation({
        mutationFn: (values: typeof form.values) => attendeeClient.updateName(values),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ['attendee-checkout-account']});
            showSuccess(t`Profile updated successfully.`);
            navigate(returnTo, {replace: true});
        },
        onError: () => showError(t`Something went wrong. Please try again.`),
    });

    return (
        <Container size="sm" py="xl">
            <h1>{t`My Profile`}</h1>
            {profile.isPending ? <LoadingMask/> : profile.isError ? (
                <Alert color="red">{t`Something went wrong. Please try again.`}</Alert>
            ) : profile.data ? (
                <Paper withBorder p="lg">
                    <form onSubmit={form.onSubmit(values => updateName.mutate(values))}>
                        <Stack>
                            <TextInput label={t`First Name`} required maxLength={40} {...form.getInputProps('first_name')}/>
                            <TextInput label={t`Last Name`} required maxLength={40} {...form.getInputProps('last_name')}/>
                            <Button type="submit" loading={updateName.isPending}>{t`Update profile`}</Button>
                        </Stack>
                    </form>
                </Paper>
            ) : (
                <Button component={Link} to={'/auth/login?' + new URLSearchParams({
                    redirect: '/attendee/profile?' + new URLSearchParams({returnTo}),
                })}>{t`Log In`}</Button>
            )}
        </Container>
    );
};

export default AttendeeProfile;
