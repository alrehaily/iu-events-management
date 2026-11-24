import {PageTitle} from "../../../common/PageTitle";
import {t} from "@lingui/macro";
import {PageBody} from "../../../common/PageBody";
import {Button, Group} from "@mantine/core"
import {IconPlus} from "@tabler/icons-react";
import {Card} from "../../../common/Card";
import {useDisclosure} from "@mantine/hooks";
import {WebhookTable} from "../../../common/WebhookTable";
import {useGetWebhooks} from "../../../../queries/useGetWebhooks.ts";
import {useParams} from "react-router";
import {CreateWebhookModal} from "../../../modals/CreateWebhookModal";
import {TableSkeleton} from "../../../common/TableSkeleton";

const Webhooks = () => {
    const {eventId} = useParams();
    const [createModalOpen, {open: openCreateModal, close: closeCreateModal}] = useDisclosure(false);
    const webhooksQuery = useGetWebhooks(eventId);
    const webhooks = webhooksQuery.data?.data?.data;

    const getWebhookCountText = () => {
        if (!webhooks) return t`Loading Webhooks`;
        const enabled = webhooks.filter(webhook => webhook.status === 'ENABLED').length;
        if (enabled === 0) return t`No Active Webhooks`;
        if (enabled === 1) return t`1 Active Webhook`;
        return t`${enabled} Active Webhooks`;
    };

    return (
        <PageBody>
            <PageTitle
                subheading={t`Send real-time order and attendee data to your external systems.`}
            >
                {t`Webhooks`}
            </PageTitle>
            <Card style={{marginBottom: "1rem"}}>
                <Group justify="space-between" align="center">
                    <span style={{fontSize: "0.875rem", color: "var(--iu-text-secondary, #475569)", fontWeight: 500}}>
                        {getWebhookCountText()}
                    </span>
                    <Button
                        color={'green'}
                        size={'sm'}
                        rightSection={<IconPlus size={16}/>}
                        onClick={openCreateModal}
                        data-testid="webhook-add-button"
                    >
                        {t`Add Webhook`}
                    </Button>
                </Group>
            </Card>
            <div>
                <TableSkeleton isVisible={!webhooks}/>

                {webhooks && (<WebhookTable
                    webhooks={webhooks}
                />)}
            </div>

            {createModalOpen && (
                <CreateWebhookModal
                    onClose={closeCreateModal}
                />
            )}
        </PageBody>
    );
}

export default Webhooks;
