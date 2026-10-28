/* eslint-disable react/no-array-index-key */

import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import { formatKilo } from "../../utils/formatKilo";

import shrimpIcon from "../../assets/images/shrimpIcon.png";
import logo from "../../assets/images/logo.png";

import {
    Container,
    ContainerDataShrimp,
    ContainerInfo,
    ContainerShrimp,
    ContentDataShrimp,
    ContentImageShrimp,
    ContentLogo,
    ContentPondsShrimp,
    ContentTextInfo,
    ContentTextShrimp,
    LocationContainer,
    LocationText,
    LogoImage,
    PondText,
    ShrimpIcon,
    ShrimpImage,
    TextInfo,
    TextShrimp,
    TextUnitMeasurement,
} from "./styles";

export const ShrimpCardShared = ({ shrimpCardRef }) => {
    const { dataShrimp } = useSelector((state) => state.shrimpCardShared);

    return (
        <Container
            ref={shrimpCardRef}
            options={{
                fileName: "publicacaoquerocamarao",
            }}
        >
            <ContainerShrimp>
                <ContentLogo>
                    <LogoImage source={logo} />
                </ContentLogo>
                <ContentPondsShrimp>
                    <LocationContainer>
                        <Feather name="map-pin" size={18} color="#e85d22" />
                        <LocationText>{dataShrimp.location}</LocationText>
                    </LocationContainer>
                    <PondText>{dataShrimp.ponds}</PondText>
                </ContentPondsShrimp>
                <ContainerInfo>
                    <ContentImageShrimp>
                        <ShrimpImage
                            uri={dataShrimp.shrimps[0].imageShrimpUri}
                        />
                    </ContentImageShrimp>
                    <ContentDataShrimp>
                        <ContentTextInfo>
                            <TextInfo>Gramatura/Quilos</TextInfo>
                        </ContentTextInfo>
                        <ContainerDataShrimp>
                            {dataShrimp.shrimps.map((shrimp, index) => (
                                <ContentTextShrimp key={index}>
                                    <ShrimpIcon source={shrimpIcon} />
                                    <TextShrimp
                                        shrimpDimentions={dataShrimp.shrimps.length}
                                    >
                                        {`${shrimp.grammage}`}
                                        <TextUnitMeasurement
                                            shrimpDimentions={dataShrimp.shrimps.length}
                                        >
                                            g
                                        </TextUnitMeasurement>
                                        {" / "}
                                        {`${formatKilo(shrimp.kilo)}`}
                                        <TextUnitMeasurement
                                            shrimpDimentions={dataShrimp.shrimps.length}
                                        >
                                            kg
                                        </TextUnitMeasurement>
                                    </TextShrimp>
                                </ContentTextShrimp>
                            ))}
                        </ContainerDataShrimp>
                    </ContentDataShrimp>
                </ContainerInfo>
            </ContainerShrimp>
        </Container>
    );
};
