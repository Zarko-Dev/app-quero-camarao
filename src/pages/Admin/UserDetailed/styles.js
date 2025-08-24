import styled from "styled-components/native";

export const Container = styled.ScrollView`
    flex: 1;
`;

export const Content = styled.View`
    flex: 1;

    justify-content: flex-start;
    align-items: center;

    padding: 14px;
`;

export const UserImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(100)};
    height: ${({ theme }) => theme.size.componentSize(100)};

    border-radius: ${({ theme }) => theme.size.componentSize(100)};

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ButtomPublications = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;
    margin: 10px 0;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const TitleButton = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ButtomDelete = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.red};

    elevation: 3;
`;

export const ButtomWhatsapp = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.green};

    elevation: 3;
`;

export const ContentButtonWhatsApp = styled.View`
    width: 32%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;
`;
