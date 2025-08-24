import { Skeleton } from "..";

import { Container, StylesSkeleton, StylesTextSkeleton } from "./styles";

export const ValueSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesSkeleton} />
    </Container>
);

export const TextSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesTextSkeleton} />
    </Container>
);
