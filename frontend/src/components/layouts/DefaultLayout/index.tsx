import {Outlet, useLocation} from "react-router";
import {Header} from "../../common/Header";
import {Container} from "@mantine/core";
import {GlobalMenu} from "../../common/GlobalMenu";
import ImpersonationBanner from "../../common/ImpersonationBanner";
import PendingDeletionBanner from "../../common/PendingDeletionBanner";
import AnnouncementDisplay from "../../common/AnnouncementDisplay";
import "../../../styles/iu/common.css";

const DefaultLayout = () => {
    const location = useLocation();

    return (
        <>
            <ImpersonationBanner />
            <PendingDeletionBanner />
            <AnnouncementDisplay />
            <Header rightContent={<GlobalMenu/>}/>
            <Container>
                <div key={location.pathname} className="iu-page-transition">
                    <Outlet/>
                </div>
            </Container>
        </>
    );
}

export default DefaultLayout;
