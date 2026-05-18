import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;
`;

export const SearchInputContainer = styled.View`
    width: 100%;
    height: 44px;
    background-color: #fff;
    border-radius: 12px;
    flex-direction: row;
    align-items: center;
    padding: 0 15px;
    border-width: 1px;
    border-color: #ffe2cc;
`;

export const StyledInput = styled.TextInput`
    flex: 1;
    margin-left: 10px;
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    color: #333;
`;
