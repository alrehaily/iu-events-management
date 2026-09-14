import {t} from '@lingui/macro';
import {IconCalendarPlus} from '@tabler/icons-react';
import {GenericErrorPage} from "../../../common/GenericErrorPage";

export const EventNotAvailable = () => {
    return (
        <GenericErrorPage
            title={t`Event Not Available`}
            description={t`The event you're looking for is not available at the moment. It may have been removed, expired, or the URL might be incorrect.`}
            pageTitle={t`Event Not Available`}
            buttonText="تصفح الفعاليات المتاحة"
            buttonUrl="/events"
            buttonIcon={<IconCalendarPlus size={18}/>}
        />
    );
};

export default EventNotAvailable;
