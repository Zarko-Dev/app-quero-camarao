import { Text, View } from "react-native";

import { formatUnreadBadge } from "../../utils/formatUnreadBadge";

export const UnreadBadge = ({ count, style }) => {
    const label = formatUnreadBadge(count);

    if (!label) return null;

    return (
        <View
            style={[
                {
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: "#e53935",
                    paddingHorizontal: 4,
                    alignItems: "center",
                    justifyContent: "center",
                },
                style,
            ]}
        >
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                {label}
            </Text>
        </View>
    );
};
