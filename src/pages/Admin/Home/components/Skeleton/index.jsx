import {
    AdminHomeCardValueSkeleton,
    AdminHomeSelectDropdownSkeleton,
    AdminHomeTitleTransactionSkeleton,
    AdminHomeTitleValueMonthRightSkeleton,
    AdminHomeTitleValueMonthSkeleton,
    AdminHomeTransactionsSkeleton,
    AdminHomeValueMonthSkeleton,
} from "../../../../../components/Skeleton/AdminHomeSkeleton";

import {
    Container,
    ContainerDropdownSelects,
    ContainerValueMonth,
    ContentTextLeft,
    ContentTextRight,
} from "../../styles";

const Skeleton = () => (
    <Container>
        <ContainerDropdownSelects>
            <AdminHomeSelectDropdownSkeleton />
            <AdminHomeSelectDropdownSkeleton />
        </ContainerDropdownSelects>
        <AdminHomeCardValueSkeleton />
        <ContainerValueMonth>
            <ContentTextLeft>
                <AdminHomeTitleValueMonthSkeleton />
                <AdminHomeValueMonthSkeleton />
            </ContentTextLeft>
            <ContentTextRight>
                <AdminHomeTitleValueMonthRightSkeleton />
                <AdminHomeValueMonthSkeleton />
            </ContentTextRight>
        </ContainerValueMonth>
        <AdminHomeTitleTransactionSkeleton />
        <AdminHomeTransactionsSkeleton />
        <AdminHomeTransactionsSkeleton />
        <AdminHomeTransactionsSkeleton />
    </Container>
);

export default Skeleton;
