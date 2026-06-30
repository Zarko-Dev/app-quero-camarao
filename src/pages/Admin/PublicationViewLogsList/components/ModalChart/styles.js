import styled from "styled-components/native";

export const Container = styled.View``;

export const ModalContent = styled.SafeAreaView`
    flex: 1;

    justify-content: center;
    align-items: center;

    background-color: "rgba(0,0,0,0.5)";
`;

export const Content = styled.View`
    width: 96%;
    margin: 0 10px;

    justify-content: center;
    align-items: center;

    border-radius: 16px;
    background-color: #ffffff;

    elevation: 6;
    padding-bottom: 16px;
`;

export const ContentHeader = styled.View`
    width: 100%;

    justify-content: flex-end;
    align-items: center;
    flex-direction: row;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(-2)};
`;

export const ButtomBack = styled.TouchableOpacity`
    padding: 10px;
`;

export const Title = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-right: 20%;

    color: ${({ theme }) => theme.colors.black};
`;

export const ContainerDropdownSelects = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 0 8px;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const ContentInputSelect = styled.View`
    width: ${({ width }) => width};
`;
