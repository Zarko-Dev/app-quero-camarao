import { ActivityIndicator, Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    justify-content: center;
    align-items: center;

    padding: 0 15px;
`;

export const ImageLogo = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(222)};
    height: ${({ theme }) => theme.size.componentSize(119)};
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(5)};

    color: ${({ theme }) => theme.colors.black};
`;

export const Subtext = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    text-align: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};

    color: ${({ theme }) => theme.colors.black};
`;

export const ActivityIndicatorStyle = styled(ActivityIndicator)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
`;
