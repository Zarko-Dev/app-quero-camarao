import { Skeleton } from "..";

import { Container, StylesSkeleton } from "./styles";

export const CardSignatureListSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesSkeleton} />
    </Container>
);
