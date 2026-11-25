import {t} from "@lingui/macro";
import {Button} from "@mantine/core";
import {useForm} from "@mantine/form";
import {useParams} from "react-router";
import {useEffect} from "react";
import {EventSettings} from "../../../../../../types.ts";
import {Card} from "../../../../../common/Card";
import {showSuccess} from "../../../../../../utilites/notifications.tsx";
import {useFormErrorResponseHandler} from "../../../../../../hooks/useFormErrorResponseHandler.tsx";
import {useUpdateEventSettings} from "../../../../../../mutations/useUpdateEventSettings.ts";
import {useGetEventSettings} from "../../../../../../queries/useGetEventSettings.ts";
import {Editor} from "../../../../../common/Editor";
import {HeadingWithDescription} from "../../../../../common/Card/CardHeading";
import {isEmptyHtml} from "../../../../../../utilites/helpers.ts";

export const HomepageAndCheckoutSettings = () => {
    const {eventId} = useParams();
    const eventSettingsQuery = useGetEventSettings(eventId);
    const updateMutation = useUpdateEventSettings();
    const form = useForm({
        initialValues: {
            pre_checkout_message: '',
            post_checkout_message: '',
            order_timeout_in_minutes: 15,
            attendee_details_collection_method: 'PER_TICKET' as 'PER_TICKET' | 'PER_ORDER',
            show_marketing_opt_in: true,
            allow_copy_details_to_all_attendees: true,
        },
        transformValues: (values) => ({
            ...values,
            pre_checkout_message: isEmptyHtml(values.pre_checkout_message) ? null : values.pre_checkout_message,
            post_checkout_message: isEmptyHtml(values.post_checkout_message) ? null : values.post_checkout_message,
            // One ticket per order, so the person who books is the attendee.
            attendee_details_collection_method: 'PER_ORDER' as const,
        }),
    });

    const formErrorHandle = useFormErrorResponseHandler();

    useEffect(() => {
        if (eventSettingsQuery?.isFetched && eventSettingsQuery?.data) {
            form.setValues({
                pre_checkout_message: eventSettingsQuery.data.pre_checkout_message,
                post_checkout_message: eventSettingsQuery.data.post_checkout_message,
                order_timeout_in_minutes: eventSettingsQuery.data.order_timeout_in_minutes,
                attendee_details_collection_method: eventSettingsQuery.data.attendee_details_collection_method || 'PER_TICKET',
                show_marketing_opt_in: eventSettingsQuery.data.show_marketing_opt_in ?? true,
                allow_copy_details_to_all_attendees: eventSettingsQuery.data.allow_copy_details_to_all_attendees ?? true,
            });
        }
    }, [eventSettingsQuery.isFetched]);

    const handleSubmit = (values: Partial<EventSettings>) => {
        updateMutation.mutate({
            eventSettings: values,
            eventId: eventId,
        }, {
            onSuccess: () => {
                showSuccess(t`Successfully Updated Homepage Settings`);
            },
            onError: (error) => {
                formErrorHandle(form, error);
            }
        });
    }

    return (
        <Card>
            <HeadingWithDescription
                heading={t`Checkout Settings`}
                description={t`Customize the event homepage and checkout messaging`}
            />
            <form onSubmit={form.onSubmit(handleSubmit as any)}>
                <fieldset disabled={eventSettingsQuery.isLoading || updateMutation.isPending}>
                    <Editor
                        label={t`Pre Checkout message`}
                        value={form.values.pre_checkout_message || ''}
                        description={t`Shown to the customer before they checkout`}
                        onChange={(value) => form.setFieldValue('pre_checkout_message', value)}
                    />

                    <Editor
                        label={t`Post Checkout message`}
                        value={form.values.post_checkout_message || ''}
                        description={(
                            <>
                                <p>
                                    {t`Shown to the customer after they checkout, on the order summary page.`}
                                </p>
                                <p>
                                    {t`This message will only be shown if order is completed successfully. Orders awaiting payment will not show this message`}
                                </p>
                            </>
                        )}
                        onChange={(value) => form.setFieldValue('post_checkout_message', value)}
                    />


                    <Button loading={updateMutation.isPending} type={'submit'}>
                        {t`Save`}
                    </Button>
                </fieldset>
            </form>
        </Card>
    );
}
