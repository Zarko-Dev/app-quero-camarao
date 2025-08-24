import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";

export const PickerModal = ({
    openSelectHours,
    onDismissSelectHours,
    onConfirm,
    openDatePicker,
    onDismissDatePicker,
    selectedDate,
    onConfirmDatePicker,
}) => (
    <>
        <DatePickerModal
            locale="pt"
            mode="single"
            visible={openDatePicker}
            onDismiss={onDismissDatePicker}
            date={selectedDate}
            onConfirm={onConfirmDatePicker}
            allowEditing={false}
            animationType="fade"
            validRange={{
                startDate: new Date(),
            }}
        />
        <TimePickerModal
            visible={openSelectHours}
            onDismiss={onDismissSelectHours}
            onConfirm={onConfirm}
            hours={12}
            minutes={14}
            label="Selecione um horário"
            cancelLabel="Cancelar"
            animationType="fade"
            locale="pt"
        />
    </>
);
