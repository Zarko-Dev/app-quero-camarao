/* eslint-disable object-curly-newline */
/* eslint-disable react/jsx-wrap-multilines */

import { Feather } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { TextInputMask } from "react-native-masked-text";

import { TextInput } from "react-native-paper";

import { theme } from "../../styles/Theme";

import { Container, InputStyle } from "./styles";

export const Input = ({
    label,
    icon,
    security = false,
    value,
    onChange,
    onBlur = () => {},
    onFocus = () => {},
    onPressIn = () => {},
    onPressOut = () => {},
    keyboardType = "default",
    mask = "****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************",
    autoCapitalize = "none",
    disable = false,
    multiline = 0,
    style,
}) => {
    const inputRef = useRef();
    const [isVisible, setIsVisible] = useState(security);

    return (
        <Container style={style}>
            <InputStyle
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                label={label}
                mode="outlined"
                left={
                    icon && (
                        <TextInput.Icon
                            icon={() => (
                                <Feather
                                    name={icon}
                                    size={24}
                                    color={theme.colors.text}
                                />
                            )}
                        />
                    )
                }
                right={
                    security && (
                        <TextInput.Icon
                            icon={() => (
                                <TouchableOpacity
                                    onPress={() => setIsVisible(!isVisible)}
                                >
                                    <Feather
                                        name={isVisible ? "eye-off" : "eye"}
                                        size={24}
                                        color={theme.colors.text}
                                    />
                                </TouchableOpacity>
                            )}
                        />
                    )
                }
                render={(props) => (
                    <TextInputMask
                        {...props}
                        value={value}
                        type="custom"
                        options={{
                            mask,
                        }}
                        ref={inputRef}
                        onChangeText={(text) => onChange(text)}
                        onBlur={onBlur}
                        onFocus={onFocus}
                    />
                )}
                outlineColor={theme.colors.quaternary}
                activeOutlineColor={theme.colors.text}
                textColor={theme.colors.text}
                secureTextEntry={isVisible}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                disabled={disable}
                multiline={!!multiline}
                numberOfLines={multiline + 1}
            />
        </Container>
    );
};
