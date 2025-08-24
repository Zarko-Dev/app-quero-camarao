/* eslint-disable object-curly-newline */
/* eslint-disable react/jsx-wrap-multilines */

import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

import { TextInput } from "react-native-paper";

import { theme } from "../../styles/Theme";

import { Container, InputStyle } from "./styles";

export const InputNoMask = ({
    label,
    icon,
    security = false,
    value,
    onChange,
    onPressIn = () => {},
    onPressOut = () => {},
    keyboardType = "default",
    autoCapitalize = "none",
    disable = false,
    multiline = 0,
    style,
}) => {
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
                        <TextInput
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
                        <TextInput
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
                outlineColor={theme.colors.quaternary}
                activeOutlineColor={theme.colors.text}
                textColor={theme.colors.text}
                secureTextEntry={isVisible}
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                disabled={disable}
                multiline={!!multiline}
                numberOfLines={multiline + 1}
            />
        </Container>
    );
};
