import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    padding: 0px 5px;
`;

export const ContentLoading = styled.View`
    flex: 1;

    justify-content: center;
    align-items: center;
`;

export const CardUser = styled.TouchableOpacity`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    margin-top: 10px;
    margin-bottom: 5px;
    padding: 8px 5px;
    border-radius: 10px;

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
`;

export const ContentUserImageInfo = styled.View`
    justify-content: center;
    align-items: center;
    flex-direction: row;
`;

export const UserImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(70)};
    height: ${({ theme }) => theme.size.componentSize(70)};

    border-radius: ${({ theme }) => theme.size.componentSize(80)};
`;

export const ContentInfo = styled.View`
    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const Title = styled.Text`
    width: ${({ theme }) => theme.size.componentSize(200)};
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const Subtitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};

    color: ${({ theme }) => theme.colors.black};
`;

export const WhatsAppIcon = styled.View`
    width: ${({ theme }) => theme.size.componentSize(50)};
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    border-radius: ${({ theme }) => theme.size.componentSize(50)};

    background-color: ${({ theme }) => theme.colors.primary};
`;
