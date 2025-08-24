import { Skeleton } from "..";

import { Container, StylesSkeleton } from "./styles";

export const CardAdsSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesSkeleton} />
    </Container>
);
