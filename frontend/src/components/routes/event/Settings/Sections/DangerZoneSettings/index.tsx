import {t} from "@lingui/macro";
import {Button, TextInput, Stack, Text} from "@mantine/core";
import {Callout} from "../../../../../common/Callout";
import {useNavigate, useParams} from "react-router";
import {useState} from "react";
import {DangerZone, DangerZoneSection} from "../../../../../common/DangerZone";
import {useGetEventDeletionStatus} from "../../../../../../queries/useGetEventDeletionStatus.ts";
import {useDeleteEvent} from "../../../../../../mutations/useDeleteEvent.ts";
import {useUpdateEventStatus} from "../../../../../../mutations/useUpdateEventStatus.ts";
import {useGetEvent} from "../../../../../../queries/useGetEvent.ts";
import {showSuccess, showError} from "../../../../../../utilites/notifications.tsx";
import {confirmationDialog} from "../../../../../../utilites/confirmationDialog.tsx";
import {EventStatus} from "../../../../../../types.ts";
import {IconTrash, IconArchive, IconArrowBackUp} from "@tabler/icons-react";
import {useIsCurrentUserAdmin} from "../../../../../../hooks/useIsCurrentUserAdmin.ts";
import {BouncingEmoji} from "../../../../../common/BouncingEmoji";
import {useIULanguage} from "../../../../../../context/IULanguageContext";

export const DangerZoneSettings = () => {
    const {isArabic} = useIULanguage();
    const {eventId} = useParams();
    const navigate = useNavigate();
    const isAdmin = useIsCurrentUserAdmin();
    const {data: deletionStatus, isLoading: isDeletionStatusLoading} = useGetEventDeletionStatus(eventId!);
    const {data: event} = useGetEvent(eventId!);
    const deleteMutation = useDeleteEvent();
    const statusMutation = useUpdateEventStatus();
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    const isArchived = event?.status === EventStatus.ARCHIVED;
    const isPendingReview = event?.status === EventStatus.PENDING_MANUAL_REVIEW;
    const deleteConfirmationPhrase = isArabic ? "حذف" : "delete";
    const isDeleteConfirmed =
        deleteConfirmation.trim().toLowerCase() === "delete" ||
        deleteConfirmation.trim() === "حذف";

    const handleDelete = () => {
        const organizerId = event?.organizer?.id;
        deleteMutation.mutate({eventId: eventId!}, {
            onSuccess: () => {
                showSuccess(isArabic ? "تم حذف الفعالية بنجاح" : t`Event deleted successfully`);
                navigate(`/manage/organizer/${organizerId}/events`);
            },
            onError: (error: any) => {
                showError(error?.response?.data?.message || (isArabic ? "تعذر حذف الفعالية" : t`Failed to delete event`));
            }
        });
    };

    const handleArchiveToggle = () => {
        const newStatus = isArchived ? EventStatus.LIVE : EventStatus.ARCHIVED;
        const message = isArchived
            ? (isArabic ? "هل أنت متأكد من رغبتك في استعادة هذه الفعالية؟" : t`Are you sure you want to restore this event?`)
            : (isArabic ? "هل أنت متأكد من أرشفة هذه الفعالية؟ لن تكون مرئية للجمهور بعد الآن." : t`Are you sure you want to archive this event? It will no longer be visible to the public.`);

        confirmationDialog(
            message,
            () => {
                statusMutation.mutate({eventId: eventId!, status: newStatus}, {
                    onSuccess: () => {
                        showSuccess(
                            isArchived
                                ? (isArabic ? "تمت استعادة الفعالية بنجاح" : t`Event restored successfully`)
                                : (isArabic ? "تمت أرشفة الفعالية بنجاح" : t`Event archived successfully`)
                        );
                    },
                    onError: (error: any) => {
                        showError(error?.response?.data?.message || (isArabic ? "تعذر تحديث حالة الفعالية" : t`Failed to update event status`));
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
                            ? "يحق فقط لمديري الحسابات حذف الفعاليات أو أرشفتها. تواصل مع مدير الحساب للمساعدة."
                            : t`Only account administrators can delete or archive events. Contact your account admin for assistance.`}
                    </Text>
                </div>
            </DangerZone>
        );
    }

    return (
        <DangerZone>
            <DangerZoneSection
                title={isArabic ? "حذف الفعالية" : t`Delete Event`}
                description={
                    deletionStatus?.can_delete
                        ? (isArabic ? "حذف هذه الفعالية وكافة البيانات المرتبطة بها نهائياً." : t`Permanently delete this event and all its associated data.`)
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
                            data-testid="event-delete-button"
                            onClick={handleDelete}
                            loading={deleteMutation.isPending}
                            disabled={!deletionStatus?.can_delete || isDeletionStatusLoading || !isDeleteConfirmed}
                            leftSection={<IconTrash size={16}/>}
                        >
                            {isArabic ? "حذف الفعالية" : t`Delete Event`}
                        </Button>
                    </>
                }
            />
            <DangerZoneSection
                title={
                    isArchived
                        ? (isArabic ? "استعادة الفعالية" : t`Restore Event`)
                        : (isArabic ? "أرشفة الفعالية" : t`Archive Event`)
                }
                description={
                    isPendingReview
                        ? (isArabic ? "هذه الفعالية قيد المراجعة اليدوية، ولا يمكن تغيير حالتها حتى اكتمال المراجعة." : t`This event is pending manual review. Its status cannot be changed until the review is complete.`)
                        : isArchived
                            ? (isArabic ? "استعادة هذه الفعالية لجعلها مرئية مجدداً." : t`Restore this event to make it visible again.`)
                            : (isArabic ? "أرشفة هذه الفعالية لإخفائها عن الجمهور. يمكنك استعادتها لاحقاً." : t`Archive this event to hide it from the public. You can restore it later.`)
                }
                action={
                    <Button
                        color={isArchived ? "blue" : "orange"}
                        variant="outline"
                        onClick={handleArchiveToggle}
                        loading={statusMutation.isPending}
                        disabled={isPendingReview}
                        leftSection={isArchived ? <IconArrowBackUp size={16}/> : <IconArchive size={16}/>}
                    >
                        {isArchived ? (isArabic ? "استعادة الفعالية" : t`Restore Event`) : (isArabic ? "أرشفة الفعالية" : t`Archive Event`)}
                    </Button>
                }
            />
        </DangerZone>
    );
};

