import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    padding: 0 10px;
`;

export const ContentSearch = styled.View`
    width: 100%;

    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const CardUser = styled.TouchableOpacity`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
    border-radius: 10px;
    padding: 8px;

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
`;

export const ContentData = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const UserImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(60)};
    height: ${({ theme }) => theme.size.componentSize(60)};

    border-radius: ${({ theme }) => theme.size.componentSize(60)};
`;

export const ContentUserInfo = styled.View`
    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const UserName = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const UserDate = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};

    color: ${({ theme }) => theme.colors.black};
`;

export const ContentWhatsapp = styled.View`
    width: ${({ theme }) => theme.size.componentSize(50)};
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    border-radius: ${({ theme }) => theme.size.componentSize(50)};
`;

export const ButtonGenerateXlsxFile = styled.TouchableOpacity`
    background-color: ${({ theme }) => theme.colors.primary};
    width: ${({ theme }) => theme.size.componentSize(30)};
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: center;
    align-items: center;

    border-radius: 10px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.5)};
    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
`;
