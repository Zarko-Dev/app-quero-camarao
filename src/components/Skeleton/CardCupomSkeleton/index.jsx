import { Skeleton } from "..";

import { Container, StylesSkeleton } from "./styles";

export const CardCupomSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesSkeleton} />
    </Container>
);
