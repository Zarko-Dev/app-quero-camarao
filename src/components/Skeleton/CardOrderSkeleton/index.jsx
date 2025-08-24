import { Skeleton } from "..";

import { Container, StylesSkeleton, StylesTextSkeleton } from "./styles";

export const CardOrderSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesSkeleton} />
    </Container>
);

export const TextSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesTextSkeleton} />
    </Container>
);
