import {useForm} from "@mantine/form";
import {Button, TextInput} from "@mantine/core";
import {t} from "@lingui/macro";
import {useEffect} from "react";
import {useParams} from "react-router";
import {showSuccess} from "../../../../../../utilites/notifications.tsx";
import {useFormErrorResponseHandler} from "../../../../../../hooks/useFormErrorResponseHandler.tsx";
import {Card} from "../../../../../common/Card";
import {HeadingWithDescription} from "../../../../../common/Card/CardHeading";
import {Organizer} from "../../../../../../types.ts";
import {useGetOrganizer} from "../../../../../../queries/useGetOrganizer.ts";
import {InputGroup} from "../../../../../common/InputGroup";
import {Editor} from "../../../../../common/Editor";
import {useUpdateOrganizer} from "../../../../../../mutations/useUpdateOrganizer.ts";

const Settings = () => {
    const {organizerId} = useParams();
    const {data: organizer} = useGetOrganizer(organizerId);
    const organizerMutation = useUpdateOrganizer();
    const handleFormError = useFormErrorResponseHandler();
    const form = useForm({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            website: '',
            description: '',
        }
    });

    const handleSubmit = (values: Partial<Organizer>) => {
        organizerMutation.mutate({
            organizerId: organizerId,
            organizerData: values,
        }, {
            onSuccess: () => {
                showSuccess(t`Successfully Updated Organizer`);
            },
            onError: (error: any) => {
                handleFormError(form, error);
            }
        });
    }

    useEffect(() => {
        form.setValues({
            name: String(organizer?.name),
            email: String(organizer?.email),
            phone: String(organizer?.phone || ''),
            website: String(organizer?.website || ''),
            description: String(organizer?.description || ''),
        })
    }, [organizer]);

    return (
        <Card>
            <HeadingWithDescription
                heading={t`Basic Information`}
                description={t`General information about your organizer`}
            />
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <fieldset disabled={organizerMutation.isPending}>
                    <InputGroup>
                        <TextInput
                            {...form.getInputProps('name')}
                            required
                            label={t`Organizer Name`}
                            description={t`This is the name of your organizer that will be displayed to your users.`}
                            placeholder={t`Awesome Organizer Ltd.`}
                        />
                        <TextInput
                            {...form.getInputProps('email')}
                            label={t`Email`}
                            required
                            description={t`This will be used for notifications and communication with your users.`}
                            placeholder={t`hello@awesome-events.com`}
                        />
                    </InputGroup>

                    <Editor
                        label={t`Description`}
                        value={form.values.description || ''}
                        editorType={'simple'}
                        description={t`A short description of your organizer that will be displayed to your users.`}
                        onChange={(value) => form.setFieldValue('description', value)}
                        maxLength={1000}
                    />

                    <InputGroup>
                        <TextInput
                            {...form.getInputProps('phone')}
                            label={t`Phone`}
                            type="tel"
                            dir="ltr"
                            placeholder="+966 5X XXX XXXX"
                        />
                        <TextInput
                            {...form.getInputProps('website')}
                            label={t`Website`}
                            type={'url'}
                            placeholder={t`https://awesome-events.com`}
                        />
                    </InputGroup>

                    <Button loading={organizerMutation.isPending} type={'submit'}>
                        {t`Save`}
                    </Button>
                </fieldset>
            </form>
        </Card>
    );
}

export default Settings;
