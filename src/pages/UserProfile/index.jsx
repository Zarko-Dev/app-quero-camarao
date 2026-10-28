import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";

import { firestore } from "../../services/Firebase";
import {
    doc,
    getDoc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    collection,
    onSnapshot,
} from "../../services/FirebaseAdapter";
import { models } from "../../services/Firebase/models";
import { getUserPublications } from "../../controllers/Publication/getUserPublications";
import { formatRatingLabel } from "../../utils/ratingLabel";
import {
    BigAvatar,
    BigAvatarText,
    Container,
    Content,
    ErrorText,
    HeaderTitle,
    InfoRow,
    ProfileName,
    RatingText,
    ScreenHeader,
} from "./styles";

const formatMemberSince = (createdAt) => {
    try {
        const d = createdAt?.toDate?.() ?? new Date(createdAt);
        if (Number.isNaN(d.getTime())) return "";
        const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        return `No Quero Camarão desde ${label}`;
    } catch {
        return "";
    }
};

export const UserProfile = ({ route, navigation }) => {
    const { userId, userName } = route.params ?? {};

    const [profile, setProfile] = useState(null);
    const [publicationsCount, setPublicationsCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            setFailed(true);
            return;
        }
        getDoc(doc(firestore, models.users, userId))
            .then((snap) => {
                if (snap.exists()) setProfile(snap.data());
                else setFailed(true);
            })
            .catch(() => setFailed(true))
            .finally(() => setLoading(false));
    }, [userId]);

    useEffect(() => {
        if (!userId || profile?.userType !== "productor") return;
        getUserPublications(userId)
            .then((result) => {
                if (!result.error && Array.isArray(result.data)) {
                    setPublicationsCount(result.data.length);
                }
            })
            .catch(() => {});
    }, [userId, profile?.userType]);

    const displayName = profile?.name || userName || "Usuário";
    const initial = (displayName?.[0] ?? "?").toUpperCase();
    const city = profile?.address?.city || profile?.city || "";
    const state = profile?.address?.state || profile?.state || "";
    const memberSince = profile?.createdAt ? formatMemberSince(profile.createdAt) : "";

    const renderBody = () => {
        if (loading) {
            return <ActivityIndicator color="#f55b1f" style={{ flex: 1 }} />;
        }
        if (failed) {
            return <ErrorText>Perfil indisponível</ErrorText>;
        }
        return (
            <Content>
                <BigAvatar>
                    <BigAvatarText>{initial}</BigAvatarText>
                </BigAvatar>
                <ProfileName>{displayName}</ProfileName>
                <RatingText>
                    {formatRatingLabel(profile?.ratingAverage, profile?.ratingCount)}
                </RatingText>
                {city ? (
                    <InfoRow>{`📍 ${city}${state ? `/${state}` : ""}`}</InfoRow>
                ) : null}
                {memberSince ? <InfoRow>{memberSince}</InfoRow> : null}
                {publicationsCount != null && publicationsCount > 0 ? (
                    <InfoRow>{`🦐 ${publicationsCount} anúncio${publicationsCount > 1 ? "s" : ""}`}</InfoRow>
                ) : null}
            </Content>
        );
    };

    return (
        <Container>
            <ScreenHeader>
                <Feather name="arrow-left" size={22} color="#36536e" onPress={() => navigation.goBack()} />
                <HeaderTitle>Perfil</HeaderTitle>
            </ScreenHeader>
            {renderBody()}
        </Container>
    );
};
