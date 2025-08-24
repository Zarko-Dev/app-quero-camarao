import { convertToMoney } from "../../utils/convertToMoney";

import {
    Banner,
    Container,
    DefaultIndicator,
    SubIndicator,
    SugestiveTitle,
    TitleGrammage,
    TitleGrammageIndicator,
    TitleValue,
    TitleValueIndicator,
} from "./styles";

import backgroundBanner from "../../assets/images/backgroundBanner.png";
import arcoLaranja from "../../assets/images/arcoLaranja.png";
import arcoCinza from "../../assets/images/arcoCinza.png";

export const InitialBanner = ({ data }) => (
    <Container>
        {data && (
            <>
                <Banner source={backgroundBanner} resizeMode="cover">
                    <SubIndicator source={arcoCinza} left>
                        <TitleGrammageIndicator left>
                            -{data.leftGrammageReference}g
                        </TitleGrammageIndicator>
                        <TitleValueIndicator left>
                            R$ {convertToMoney(data.priceLeftGramageReference)}
                        </TitleValueIndicator>
                    </SubIndicator>
                    <DefaultIndicator source={arcoLaranja}>
                        <TitleGrammage>{data.defaultGrammage}g</TitleGrammage>
                        <TitleValue>
                            R${" "}
                            {convertToMoney(
                                data.shrimpPrice10g === 0
                                    ? data.defaultPriceGrammage
                                    : data.shrimpPrice10g,
                            )}
                        </TitleValue>
                    </DefaultIndicator>
                    <SubIndicator source={arcoCinza} right>
                        <TitleGrammageIndicator right>
                            +{data.rightGrammagereference}g
                        </TitleGrammageIndicator>
                        <TitleValueIndicator right>
                            R${" "}
                            {convertToMoney(data.priceRightGrammageReference)}
                        </TitleValueIndicator>
                    </SubIndicator>
                </Banner>
                {data.showSuggestPrice && (
                    <SugestiveTitle>Preço sugerido!</SugestiveTitle>
                )}
            </>
        )}
    </Container>
);
