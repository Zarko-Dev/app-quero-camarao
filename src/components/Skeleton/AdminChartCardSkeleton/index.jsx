import { Skeleton } from "..";

import { Container, StylesSkeleton } from "./styles";

export const AdminChartCardSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesSkeleton} />
    </Container>
);
