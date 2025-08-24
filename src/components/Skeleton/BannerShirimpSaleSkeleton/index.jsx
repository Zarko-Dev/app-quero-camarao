import { Skeleton } from "..";

import { Container, StylesSkeleton } from "./styles";

export const BannerShirimpSaleSkeleton = () => (
    <Container>
        <Skeleton StyleSheet={StylesSkeleton} />
    </Container>
);
