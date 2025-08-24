import { Skeleton } from "..";

import {
    Container,
    ContainerRight,
    StylesAdminHomecardValueSkeleton,
    StylesAdminHomeSelectDropdownSkeleton,
    StylesAdminHomeTitleTransactionSkeleton,
    StylesAdminHomeTitleValueMonthRightSkeleton,
    StylesAdminHomeTitleValueMonthSkeleton,
    StylesAdminHomeTransactionsSkeleton,
    StylesAdminHomeValueMonthSkeleton,
} from "./styles";

export const AdminHomeSelectDropdownSkeleton = () => (
    <Container dataWidth={200}>
        <Skeleton StyleSheet={StylesAdminHomeSelectDropdownSkeleton} />
    </Container>
);

export const AdminHomeCardValueSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesAdminHomecardValueSkeleton} />
    </Container>
);

export const AdminHomeTitleValueMonthSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesAdminHomeTitleValueMonthSkeleton} />
    </Container>
);

export const AdminHomeTitleValueMonthRightSkeleton = () => (
    <ContainerRight>
        <Skeleton StyleSheet={StylesAdminHomeTitleValueMonthRightSkeleton} />
    </ContainerRight>
);

export const AdminHomeValueMonthSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesAdminHomeValueMonthSkeleton} />
    </Container>
);

export const AdminHomeTitleTransactionSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesAdminHomeTitleTransactionSkeleton} />
    </Container>
);

export const AdminHomeTransactionsSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesAdminHomeTransactionsSkeleton} />
    </Container>
);
