import { useState } from "react";
import { AddressCard } from "./components/AddressCard";
import { PaymentButton } from "./components/PaymentButton";
import { ResumeCrad } from "./components/ResumeCrad";
import { ShrimpCard } from "./components/ShrimpCard";

import { Container, Content, ContentResume } from "./styles";

export const Payment = () => {
    const [loadingValid, setLoadingValid] = useState(false);

    return (
        <Container>
            <Content>
                <AddressCard />
                <ShrimpCard />
            </Content>
            <ContentResume>
                <ResumeCrad
                    loading={loadingValid}
                    actionLoading={setLoadingValid}
                />
                <PaymentButton loading={loadingValid} />
            </ContentResume>
        </Container>
    );
};
