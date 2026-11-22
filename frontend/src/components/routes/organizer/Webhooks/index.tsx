import { t } from "@lingui/macro";
import { Button, Group, Box } from "@mantine/core"
import { IconPlus } from "@tabler/icons-react";
import { Card } from "../../../common/Card";
import { useDisclosure } from "@mantine/hooks";
import { OrganizerWebhookTable } from "../../../common/OrganizerWebhookTable";
import { useGetOrganizerWebhooks } from "../../../../queries/useGetOrganizerWebhooks";
import { useParams } from "react-router";
import { CreateOrganizerWebhookModal } from "../../../modals/CreateOrganizerWebhookModal";
import { TableSkeleton } from "../../../common/TableSkeleton";
import { IdParam } from "../../../../types";
import { PageBody } from "../../../common/PageBody";
import { PageTitle } from "../../../common/PageTitle";

export default function Webhooks() {
    const { organizerId } = useParams();
    const [createModalOpen, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
    const webhooksQuery = useGetOrganizerWebhooks(organizerId as IdParam);
    const webhooks = webhooksQuery.data?.data?.data;

    const getWebhookCountText = () => {
        if (!webhooks) return t`Loading Webhooks`;
        if (webhooks.length === 0) return t`No Active Webhooks`;
        if (webhooks.length === 1) return t`1 Active Webhook`;
        return t`${webhooks.length} Active Webhooks`;
    };

    return (
        <PageBody>
            <PageTitle>{t`Webhooks`}</PageTitle>
            <Box>
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
                    <TableSkeleton isVisible={!webhooks} />

                    {webhooks && (<OrganizerWebhookTable
                        webhooks={webhooks}
                        openCreateModal={openCreateModal}
                    />)}
                </div>

                {createModalOpen && (
                    <CreateOrganizerWebhookModal
                        onClose={closeCreateModal}
                    />
                )}
            </Box>
        </PageBody>
    );
}
