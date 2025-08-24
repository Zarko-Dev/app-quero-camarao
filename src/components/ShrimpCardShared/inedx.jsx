/* eslint-disable react/no-array-index-key */

import { useSelector } from "react-redux";

import { formatKilo } from "../../utils/formatKilo";

import shrimpIcon from "../../assets/images/shrimpIcon.png";
import logo from "../../assets/images/logo.png";

import {
    ButtonShare,
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
    LocationText,
    LogoImage,
    PondText,
    ShrimpIcon,
    ShrimpImage,
    TextInfo,
    TextShrimp,
    TextUnitMeasurement,
} from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";

export const ShrimpCardShared = ({ shrimpCardRef }) => {
    const { dataShrimp } = useSelector((state) => state.shrimpCardShared);

    return (
        <Container
            ref={shrimpCardRef}
            options={{
                fileName: "publicacaoquerocamarao",
            }}
        >
            <ContainerShrimp style={BoxShadowIos}>
                <ContentLogo>
                    <LogoImage source={logo} />
                </ContentLogo>
                <ContentPondsShrimp>
                    <LocationText>{dataShrimp.location}</LocationText>
                    <PondText>{dataShrimp.ponds}</PondText>
                    <ButtonShare />
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
                        <ContainerDataShrimp
                            shrimpDimentions={dataShrimp.shrimps.length}
                        >
                            {dataShrimp.shrimps.map((shrimp, index) => (
                                <ContentTextShrimp key={index}>
                                    <ShrimpIcon source={shrimpIcon} />
                                    <TextShrimp
                                        shrimpDimentions={
                                            dataShrimp.shrimps.length
                                        }
                                    >
                                        {`${shrimp.grammage}`}
                                        <TextUnitMeasurement
                                            shrimpDimentions={
                                                dataShrimp.shrimps.length
                                            }
                                        >
                                            g
                                        </TextUnitMeasurement>{" "}
                                        / {`${formatKilo(shrimp.kilo)}`}
                                        <TextUnitMeasurement
                                            shrimpDimentions={
                                                dataShrimp.shrimps.length
                                            }
                                        >
                                            Kg
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
