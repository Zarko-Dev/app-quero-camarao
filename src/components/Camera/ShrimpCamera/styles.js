import styled from "styled-components/native";
import { CameraView } from "expo-camera";

export const Container = styled.SafeAreaView`
    flex: 1;
    justify-content: center;
`;

export const CameraStyle = styled(CameraView)`
    flex: 1;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
`;

export const ContentHeader = styled.View`
    width: 100%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    margin-left: ${({ theme }) => theme.size.dimentionsSize(4)};
`;

export const ButtonBackCamera = styled.TouchableOpacity`
    justify-content: center;
    align-items: center;

    width: ${({ theme }) => theme.size.componentSize(40)};
    height: ${({ theme }) => theme.size.componentSize(40)};

    border-radius: 80px;

    background-color: ${({ theme }) => theme.colors.primary};
    elevation: 3;
`;

export const ContentFooter = styled.View`
    width: 100%;

    justify-content: flex-end;
    align-items: center;
    flex-direction: row;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const ContentButtonTakePicture = styled.View`
    justify-content: center;
    align-items: center;

    width: ${({ theme }) => theme.size.componentSize(70)};
    height: ${({ theme }) => theme.size.componentSize(70)};

    border: 8px ${({ theme }) => theme.colors.white} solid;
    border-radius: 40px;

    margin-right: 20%;
`;

export const ButtonTakePicture = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(40)};
    height: ${({ theme }) => theme.size.componentSize(40)};

    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 20px;
`;

export const ButtonGalery = styled.TouchableOpacity`
    margin-right: 10%;
`;
