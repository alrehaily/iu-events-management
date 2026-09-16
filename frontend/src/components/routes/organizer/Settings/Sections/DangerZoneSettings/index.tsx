import {t} from "@lingui/macro";
import {Button, TextInput, Stack, Text} from "@mantine/core";
import {Callout} from "../../../../../common/Callout";
import {useNavigate, useParams} from "react-router";
import {useState} from "react";
import {DangerZone, DangerZoneSection} from "../../../../../common/DangerZone";
import {useGetOrganizerDeletionStatus} from "../../../../../../queries/useGetOrganizerDeletionStatus.ts";
import {useDeleteOrganizer} from "../../../../../../mutations/useDeleteOrganizer.ts";
import {useUpdateOrganizerStatus} from "../../../../../../mutations/useUpdateOrganizerStatus.ts";
import {useGetOrganizer} from "../../../../../../queries/useGetOrganizer.ts";
import {useGetOrganizers} from "../../../../../../queries/useGetOrganizers.ts";
import {showSuccess, showError} from "../../../../../../utilites/notifications.tsx";
import {confirmationDialog} from "../../../../../../utilites/confirmationDialog.tsx";
import {OrganizerStatus} from "../../../../../../types.ts";
import {IconTrash, IconArchive, IconArrowBackUp} from "@tabler/icons-react";
import {useIsCurrentUserAdmin} from "../../../../../../hooks/useIsCurrentUserAdmin.ts";
import {BouncingEmoji} from "../../../../../common/BouncingEmoji";
import {useIULanguage} from "../../../../../../context/IULanguageContext";

export const DangerZoneSettings = () => {
    const {isArabic} = useIULanguage();
    const {organizerId} = useParams();
    const navigate = useNavigate();
    const isAdmin = useIsCurrentUserAdmin();
    const {data: deletionStatus, isLoading: isDeletionStatusLoading} = useGetOrganizerDeletionStatus(organizerId!);
    const {data: organizer} = useGetOrganizer(organizerId!);
    const {data: organizers} = useGetOrganizers();
    const deleteMutation = useDeleteOrganizer();
    const statusMutation = useUpdateOrganizerStatus();
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const isArchived = organizer?.status === OrganizerStatus.ARCHIVED;
    const deleteConfirmationPhrase = isArabic ? "حذف" : "delete";
    const isDeleteConfirmed =
        deleteConfirmation.trim().toLowerCase() === "delete" ||
        deleteConfirmation.trim() === "حذف";

    const activeOrganizerCount = organizers?.data?.filter(
        org => org.status !== OrganizerStatus.ARCHIVED
    ).length ?? 0;
    const isLastActiveOrganizer = !isArchived && activeOrganizerCount <= 1;

    const handleDelete = () => {
        deleteMutation.mutate({organizerId: organizerId!}, {
            onSuccess: () => {
                showSuccess(isArabic ? "تم حذف المنظم بنجاح" : t`Organizer deleted successfully`);
                navigate('/manage/events');
            },
            onError: (error: any) => {
                showError(error?.response?.data?.message || (isArabic ? "تعذر حذف المنظم" : t`Failed to delete organizer`));
            }
        });
    };

    const handleArchiveToggle = () => {
        const newStatus = isArchived ? OrganizerStatus.LIVE : OrganizerStatus.ARCHIVED;
        const message = isArchived
            ? (isArabic ? "هل أنت متأكد من رغبتك في استعادة هذا المنظم؟" : t`Are you sure you want to restore this organizer?`)
            : (isArabic ? "هل أنت متأكد من أرشفة هذا المنظم؟ سيؤدي هذا أيضاً إلى أرشفة كافة الفعاليات التابعة له." : t`Are you sure you want to archive this organizer? This will also archive all events belonging to this organizer.`);

        confirmationDialog(
            message,
            () => {
                statusMutation.mutate({organizerId: organizerId!, status: newStatus}, {
                    onSuccess: () => {
                        showSuccess(
                            isArchived
                                ? (isArabic ? "تمت استعادة المنظم بنجاح" : t`Organizer restored successfully`)
                                : (isArabic ? "تمت أرشفة المنظم بنجاح" : t`Organizer archived successfully`)
                        );
                    },
                    onError: (error: any) => {
                        showError(error?.response?.data?.message || (isArabic ? "تعذر تحديث حالة المنظم" : t`Failed to update organizer status`));
                    }
                });
            },
            {
                confirm: isArchived ? (isArabic ? "استعادة" : t`Restore`) : (isArabic ? "أرشفة" : t`Archive`),
                cancel: isArabic ? "إلغاء" : t`Cancel`
            }
        );
    };

    if (!isAdmin) {
        return (
            <DangerZone>
                <div style={{textAlign: 'center', padding: '20px 0'}}>
                    <BouncingEmoji emoji="✋"/>
                    <h3>{isArabic ? "صلاحيات الأدمن مطلوبة" : t`Admin Access Required`}</h3>
                    <Text size="sm" c="dimmed">
                        {isArabic
                            ? "يحق فقط لمديري الحسابات حذف المنظمين أو أرشفتهم. تواصل مع مدير الحساب للمساعدة."
                            : t`Only account administrators can delete or archive organizers. Contact your account admin for assistance.`}
                    </Text>
                </div>
            </DangerZone>
        );
    }

    return (
        <DangerZone>
            <DangerZoneSection
                title={isArabic ? "حذف المنظم" : t`Delete Organizer`}
                description={
                    deletionStatus?.can_delete
                        ? (isArabic ? "حذف هذا المنظم وكافة الفعاليات التابعة له نهائياً." : t`Permanently delete this organizer and all its events.`)
                        : deletionStatus?.reason || (isArabic ? "جاري التحميل..." : t`Loading...`)
                }
                action={
                    <>
                        {!isDeletionStatusLoading && !deletionStatus?.can_delete && (
                            <Callout variant="info" style={{marginBottom: 8}}>
                                {deletionStatus?.reason}
                            </Callout>
                        )}
                        {deletionStatus?.can_delete && (
                            <Stack gap="xs" maw={400}>
                                <Text size="sm" c="dimmed">
                                    {isArabic ? 'اكتب "حذف" للتأكيد' : t`Type "delete" to confirm`}
                                </Text>
                                <TextInput
                                    placeholder={deleteConfirmationPhrase}
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.currentTarget.value)}
                                />
                            </Stack>
                        )}
                        <Button
                            mt="sm"
                            color="red"
                            variant="outline"
                            onClick={handleDelete}
                            loading={deleteMutation.isPending}
                            disabled={!deletionStatus?.can_delete || isDeletionStatusLoading || !isDeleteConfirmed}
                            leftSection={<IconTrash size={16}/>}
                        >
                            {isArabic ? "حذف المنظم" : t`Delete Organizer`}
                        </Button>
                    </>
                }
            />
            <DangerZoneSection
                title={
                    isArchived
                        ? (isArabic ? "استعادة المنظم" : t`Restore Organizer`)
                        : (isArabic ? "أرشفة المنظم" : t`Archive Organizer`)
                }
                description={
                    isArchived
                        ? (isArabic ? "استعادة هذا المنظم وتفعيله مجدداً." : t`Restore this organizer and make it active again.`)
                        : isLastActiveOrganizer
                            ? (isArabic ? "لا يمكنك أرشفة آخر منظم نشط في حسابك." : t`You cannot archive the last active organizer on your account.`)
                            : (isArabic ? "أرشفة هذا المنظم. سيؤدي هذا أيضاً إلى أرشفة كافة الفعاليات التابعة له." : t`Archive this organizer. This will also archive all events belonging to this organizer.`)
                }
                action={
                    <Button
                        color={isArchived ? "blue" : "orange"}
                        variant="outline"
                        onClick={handleArchiveToggle}
                        loading={statusMutation.isPending}
                        disabled={!isArchived && isLastActiveOrganizer}
                        leftSection={isArchived ? <IconArrowBackUp size={16}/> : <IconArchive size={16}/>}
                    >
                        {isArchived ? (isArabic ? "استعادة المنظم" : t`Restore Organizer`) : (isArabic ? "أرشفة المنظم" : t`Archive Organizer`)}
                    </Button>
                }
            />
        </DangerZone>
    );
};

