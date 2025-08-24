import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    justify-content: space-between;
    align-items: center;
`;

export const ContentForm = styled.ScrollView`
    width: 95%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const TextSelectLink = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(0.5)};

    color: ${({ alert, theme }) =>
        alert ? theme.colors.red : theme.colors.black};
`;

export const ContentTextBanner = styled.View`
    justify-content: flex-end;
    align-items: center;
    flex-direction: row;
`;

export const TextBannerType = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(-1)};
`;

export const ContentRedirectType = styled.View`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const ContentGroupRadio = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const ContentRadio = styled.View`
    align-items: center;
    flex-direction: row;

    margin-right: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const TitleRadio = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
`;

export const BannerContent = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(174)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const TextBanner = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ButtonRegisterAds = styled.TouchableOpacity`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
