/* eslint-disable object-curly-newline */

import { Button, Dialog, Portal, Text } from "react-native-paper";
import { InputNoMask } from "../../../../../components/InputNoMask";

export const DrawPrizeNameDialog = ({
    visible,
    hideDialog,
    title,
    text,
    textActionButton,
    actionButton,
    textSecondaryActionButton,
    secondaryActionButton,
    dismissable = true,
    showCancelButton = true,
    inputValue = "",
    actionInputValue = () => {},
}) => (
    <Portal>
        <Dialog
            visible={visible}
            onDismiss={hideDialog}
            dismissable={dismissable}
        >
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Content>
                <Text variant="bodyMedium">{text}</Text>
                <InputNoMask
                    label="Descrição"
                    onChange={actionInputValue}
                    value={inputValue}
                    autoCapitalize="sentences"
                />
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={actionButton}>{textActionButton}</Button>
                {textSecondaryActionButton ? (
                    <Button onPress={secondaryActionButton}>
                        {textSecondaryActionButton}
                    </Button>
                ) : (
                    showCancelButton && (
                        <Button onPress={hideDialog}>Cancelar</Button>
                    )
                )}
            </Dialog.Actions>
        </Dialog>
    </Portal>
);
