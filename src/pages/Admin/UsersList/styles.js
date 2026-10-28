import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #f5f5f5;
    padding: 0 12px;
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

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.8)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(0.8)};
    border-radius: 14px;
    padding: 12px 14px;

    background-color: #ffffff;
    border-left-width: 4px;
    border-left-color: ${({ theme }) => theme.colors.primary};

    elevation: 2;
    shadow-color: #000;
    shadow-offset: 0px 1px;
    shadow-opacity: 0.08;
    shadow-radius: 4px;
`;

export const ContentData = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    flex: 1;
`;

export const UserImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(56)};
    height: ${({ theme }) => theme.size.componentSize(56)};

    border-radius: ${({ theme }) => theme.size.componentSize(56)};
    border-width: 2px;
    border-color: ${({ theme }) => theme.colors.primary};
`;

export const ContentUserInfo = styled.View`
    margin-left: 12px;
    flex: 1;
`;

export const UserName = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: 4px;
`;

export const InfoRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
`;

export const UserDate = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #666666;
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

export const ButtonGeneratePdfFile = styled.TouchableOpacity`
    background-color: #d32f2f;
    width: ${({ theme }) => theme.size.componentSize(30)};
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: center;
    align-items: center;

    border-radius: 10px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.5)};
    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
`;
