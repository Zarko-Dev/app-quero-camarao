import styled from "styled-components/native";

export const ActionsContainer = styled.View`
    flex-direction: row;
    align-items: center;
    flex: 1;
`;

export const ActionButton = styled.TouchableOpacity`
    justify-content: center;
    align-items: center;
    padding-horizontal: 16px;
    padding-vertical: 12px;
    min-width: 80px;
`;

export const ActionText = styled.Text`
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    margin-top: 4px;
`;

export const DeleteAction = styled(ActionButton)`
    background-color: #e74c3c;
`;

export const MuteAction = styled(ActionButton)`
    background-color: #f55b1f;
`;