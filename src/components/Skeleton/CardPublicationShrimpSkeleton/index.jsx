import { Skeleton } from "..";

import { Container, StylesSkeleton } from "./styles";

export const CardPublicationShrimpSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesSkeleton} />
    </Container>
);
