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
    ContainerDropdowSelects,
    ContainerValueMonth,
    ContentTextLeft,
    ContenttextRight,
} from "../../styles";

const Skeleton = () => (
    <Container>
        <ContainerDropdowSelects>
            <AdminHomeSelectDropdownSkeleton />
            <AdminHomeSelectDropdownSkeleton />
        </ContainerDropdowSelects>
        <AdminHomeCardValueSkeleton />
        <ContainerValueMonth>
            <ContentTextLeft>
                <AdminHomeTitleValueMonthSkeleton />
                <AdminHomeValueMonthSkeleton />
            </ContentTextLeft>
            <ContenttextRight>
                <AdminHomeTitleValueMonthRightSkeleton />
                <AdminHomeValueMonthSkeleton />
            </ContenttextRight>
        </ContainerValueMonth>
        <AdminHomeTitleTransactionSkeleton />
        <AdminHomeTransactionsSkeleton />
        <AdminHomeTransactionsSkeleton />
        <AdminHomeTransactionsSkeleton />
    </Container>
);

export default Skeleton;
