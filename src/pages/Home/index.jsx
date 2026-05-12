/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Fuse from "fuse.js";
import { Easing, useSharedValue, withSpring } from "react-native-reanimated";
import * as Notifications from "expo-notifications";
import Toast from "react-native-toast-message";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { dataRoutes } from "../../routes/dataRoutes";
import {
    GetUserStorage,
    SetUserStorage,
} from "../../services/Storage/UserStorage";
import { LoginActions } from "../Login/actions";

import { SearchBar } from "../../components/SearchBar";
import { ShrimpCardList } from "./components/ShrimpCardList";
import { FilterContent } from "../../components/FilterContent";
import { DialogComponent } from "../../components/Dialog";
import { ModalConcludedRegister } from "./components/ModalConcludedRegister";
import { ShrimpCardShared } from "../../components/ShrimpCardShared/inedx";
import { SelectAccountModal } from "./components/SelectAccountModal";
import {
    getAllShrimpPondsRealTime,
    getMoreShrimpPonds,
} from "../../controllers/ShrimpPonds/getAll";

import {
    Container,
    ContentInitialBanner,
    ContentSearchFilter,
    PublicShrimpButton,
    ShrimpIcon,
    TextButton,
    ScreenHeader,
    SearchBarContainer,
    FilterButton,
    FilterButtonText,
    ContentCardsList,
} from "./styles";
import { theme } from "../../styles/Theme";

import shrimpIconWhite from "../../assets/images/shrimpIconWhite.png";
import { updateUserNotification } from "../../controllers/User/notification";
import { ModalUpdateClientLocation } from "./components/ModalUpdateClientLocation";
import { BannerShrimpSalePrice } from "../../components/BannerShrimpSalePrice";
import { Feather } from "@expo/vector-icons";

let time = null;
let cachedInitialData = null;
let cachedPublications = [];
let cachedLastVisible = null;
let cachedPrefetchedPublications = [];

export const Home = ({ navigation }) => {
    const dispatch = useDispatch();

    const viewShotShrimpCardRef = useRef(null);
    const isPrefetchingRef = useRef(false);

    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [showAlertUserType, setShowAlertUserType] = useState(false);
    const [showModalConcludedRegister, setShowModalConcludedRegister] =
        useState(false);
    const [showModalUpdateClientLocation, setShowModalUpdateClientLocation] =
        useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [initialData, setInitialdata] = useState(cachedInitialData);
    const [dataPublication, setDataPublication] = useState(cachedPublications);
    const [userType, setUserType] = useState("client");
    const [dataPublicationFiltered, setDataPublicationFiltered] = useState([]);
    const [dataAdvertising] = useState([]);
    const [lastVisible, setLastVisible] = useState(cachedLastVisible);
    const [loadingNextPublications, setLoadingNextPublications] =
        useState(false);
    const [showEndPublications, setShowEndPublications] = useState(false);

    const [showFilter, setShowFilter] = useState(false);
    const [hidedataFilter, setHidedataFilter] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const widthSize = Number(theme.size.componentSize(239).replace("px", ""));
    const width = useSharedValue(showFilter ? widthSize : 0);

    const { isAuthenticated } = useSelector((state) => state.login);

    const executeValidationNotification = async () => {
        if (isAuthenticated) {
            const dataUser = await GetUserStorage();
            const { status } = await Notifications.getPermissionsAsync();

            if (status !== "granted") {
                Toast.show({
                    type: "error",
                    text1: "Você não possui permissão para notificações",
                    text2: "Permita que a Quero Camarão envie notificações!",
                });

                await Notifications.requestPermissionsAsync();
            } else {
                const userNotificationToken = (
                    await Notifications.getExpoPushTokenAsync({
                        projectId: Constants.expoConfig.extra.eas.projectId,
                    })
                ).data;
                const platform = Platform.OS;

                if (dataUser?.notification) {
                    if (
                        dataUser.notification.platform !== platform ||
                        dataUser.notification.token !== userNotificationToken
                    ) {
                        await updateUserNotification(
                            dataUser.email,
                            platform,
                            userNotificationToken,
                        );

                        await SetUserStorage({
                            ...dataUser,
                            notification: {
                                platform,
                                token: userNotificationToken,
                            },
                        });
                    }
                } else {
                    await updateUserNotification(
                        dataUser.email,
                        platform,
                        userNotificationToken,
                    );

                    await SetUserStorage({
                        ...dataUser,
                        notification: {
                            platform,
                            token: userNotificationToken,
                        },
                    });
                }
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            setShowEndPublications(false);
            setLoadingNextPublications(false);

            const loadInitialData = async () => {
                getAllShrimpPondsRealTime((dataShrimpPonds) => {
                    cachedPublications = dataShrimpPonds;
                    cachedInitialData = dataShrimpPonds;
                    setDataPublication(dataShrimpPonds);
                    setInitialdata(dataShrimpPonds);
                    const nextLastVisible =
                        dataShrimpPonds[dataShrimpPonds.length - 1] ?? null;
                    cachedLastVisible = nextLastVisible;
                    setLastVisible(nextLastVisible);
                    cachedPrefetchedPublications = [];
                    prefetchNextPage(nextLastVisible);
                });

                const user = await GetUserStorage();

                if (user) {
                    setUserType(user.userType);
                    dispatch({ type: LoginActions.ISAUTHENTICATED_ACTION });

                    if (
                        user.userType === "client" &&
                        (!user?.state || !user?.city)
                    ) {
                        setShowModalUpdateClientLocation(true);
                    }
                }
            };

            loadInitialData();
        }, []),
    );

    useEffect(() => {
        executeValidationNotification().then().catch();
    }, [isAuthenticated]);

    const searchData = (term) => {
        const searchTerm = term.toLowerCase();
        let keys = ["location", "ponds", "shrimps.grammage", "shrimps.kilo"];

        if (searchTerm.includes("viveiro") || searchTerm.includes("viveiros")) {
            keys = ["ponds"];
        }

        if (
            searchTerm.includes("grama") ||
            searchTerm.includes("gramas") ||
            searchTerm.includes("g")
        ) {
            keys = ["shrimps.grammage"];
        }

        const options = {
            keys,
            includeScore: true,
            threshold: 0.4,
        };

        const fuse = new Fuse(initialData, options);

        const searchResults = fuse.search(
            searchTerm.split(" ")[0].replaceAll("g", ""),
        );
        return searchResults.map((result) => result.item);
    };

    const debounce = (value) => {
        setIsLoading(true);
        clearTimeout(time);

        time = setTimeout(() => {
            setDataPublicationFiltered(searchData(value ?? ""));
            setIsLoading(false);
        }, 1000);
    };

    const handleSearchPublications = (value) => {
        setSearchValue(value);

        if (value !== "") {
            debounce(value);
        } else {
            setDataPublicationFiltered([]);
        }
    };

    const handleRedirectPublishShrimp = async () => {
        const dataUser = await GetUserStorage();

        if (!isAuthenticated) {
            setModalVisible(true);
        } else if (dataUser.userType !== "productor") {
            setShowAlertVisible(true);
        } else {
            navigation.navigate(dataRoutes.publication);
        }
    };

    const handleOpenModalConcludedRegister = () => {
        setShowModalConcludedRegister(true);
        setShowAlertVisible(false);
    };

    const handleOpenFilter = () => {
        width.value = withSpring(showFilter ? 0 : widthSize, {
            damping: 100,
            stiffness: 100,
            easing: Easing.inOut(Easing.ease),
        });

        setHidedataFilter(false);
        setShowFilter(true);
    };

    const handleCloseFilter = () => {
        width.value = withSpring(showFilter ? 0 : widthSize, {
            damping: 100,
            stiffness: 100,
            easing: Easing.inOut(Easing.ease),
        });

        setHidedataFilter(true);
        setTimeout(() => {
            setShowFilter(false);
        }, 100);
    };

    const handleClearFilter = () => {
        setDataPublicationFiltered([]);
    };

    const handleFilter = (dataFilter) => {
        const { grammage, kilo, location, ponds } = dataFilter;

        if (
            !(
                grammage.length === 0 &&
                kilo === "" &&
                location === "/" &&
                ponds.length === 0
            )
        ) {
            setSearchValue("");
            setDataPublicationFiltered([]);

            const dataRenderFilter = dataPublication.filter((item) => {
                const filterByPonds =
                    ponds.length === 0 || ponds.includes(item.ponds);
                const filterByKilo =
                    kilo === "" ||
                    item.shrimps.some((shrimp) => shrimp.kilo === kilo);
                const filterByGrammage =
                    grammage.length === 0 ||
                    item.shrimps.some((shrimp) =>
                        grammage.includes(shrimp.grammage),
                    );
                let filterByLocation;

                if (Array.isArray(location)) {
                    let valid = false;
                    for (let index = 0; index < location.length; index++) {
                        if (
                            !valid &&
                            (location[index] === "/" ||
                                item.location === location[index])
                        ) {
                            filterByLocation =
                                location[index] === "/" ||
                                item.location === location[index];
                            valid = true;
                        }
                    }
                } else {
                    filterByLocation =
                        location === "/" || item.location.includes(location);
                }

                return (
                    filterByPonds &&
                    filterByKilo &&
                    filterByGrammage &&
                    filterByLocation
                );
            });

            setDataPublicationFiltered(dataRenderFilter);
        }
    };

    const handleRedirectProductorRegister = () => {
        setShowAlertUserType(false);
        navigation.navigate(dataRoutes.register, { tabIndex: 0 });
    };

    const handleRedirectClientRegister = () => {
        setShowAlertUserType(false);
        navigation.navigate(dataRoutes.register, { tabIndex: 1 });
    };

    const prefetchNextPage = useCallback(async (cursor) => {
        if (!cursor || showEndPublications || isPrefetchingRef.current) {
            return;
        }

        isPrefetchingRef.current = true;
        try {
            const nextData = await getMoreShrimpPonds(cursor);
            cachedPrefetchedPublications = nextData;

            if (!nextData.length) {
                setShowEndPublications(true);
            }
        } catch (error) {
            console.error("Error prefetching shrimp ponds:", error);
        } finally {
            isPrefetchingRef.current = false;
        }
    }, [showEndPublications]);

    const handleEndReached = useCallback(async () => {
        if (!showEndPublications && !loadingNextPublications) {
            const hasPrefetchedData = cachedPrefetchedPublications.length > 0;
            if (!hasPrefetchedData) {
                setLoadingNextPublications(true);
            }

            try {
                if (!lastVisible) {
                    setLoadingNextPublications(false);
                    return;
                }

                let moreShrimpPonds = cachedPrefetchedPublications;
                cachedPrefetchedPublications = [];

                if (!moreShrimpPonds.length) {
                    moreShrimpPonds = await getMoreShrimpPonds(lastVisible);
                }

                if (!moreShrimpPonds.length) {
                    setShowEndPublications(true);
                    return;
                }

                const nextLastVisible =
                    moreShrimpPonds[moreShrimpPonds.length - 1];
                cachedLastVisible = nextLastVisible;
                setLastVisible(nextLastVisible);
                setDataPublication((prevState) => {
                    const nextData = [...prevState, ...moreShrimpPonds];
                    cachedPublications = nextData;
                    cachedInitialData = nextData;
                    return nextData;
                });

                prefetchNextPage(nextLastVisible);
            } catch (error) {
                console.error("Error fetching more shrimp ponds:", error);
            } finally {
                setLoadingNextPublications(false);
            }
        }
    }, [
        showEndPublications,
        loadingNextPublications,
        lastVisible,
        prefetchNextPage,
    ]);

    const getDataPublication = () => {
        const data1 = Object.values(
            dataPublicationFiltered.reduce(
                (acc, item) => ({ ...acc, [item.id]: item }),
                {},
            ),
        );
        const data2 = Object.values(
            dataPublication.reduce(
                (acc, item) => ({ ...acc, [item.id]: item }),
                {},
            ),
        );

        return data1.length === 0 ? data2 : data1;
    };

    const handleRedirecSalesList = () => {
        navigation.navigate(dataRoutes.salesList);
    };

    const generateInitialBanner = () => {
        return (
        <BannerShrimpSalePrice open={handleRedirecSalesList} />
    );
    };

    return (
        <>
            <Container>
                <ScreenHeader>
                    <ContentSearchFilter>
                        <SearchBarContainer>
                            <SearchBar
                                searchText={searchValue}
                                onChange={handleSearchPublications}
                                isLoadingSearch={isLoading}
                            />
                        </SearchBarContainer>
                        <FilterButton onPress={handleOpenFilter}>
                            <Feather name="filter" size={20} color={theme.colors.primary} />
                            <FilterButtonText>Filtrar</FilterButtonText>
                        </FilterButton>
                    </ContentSearchFilter>
                </ScreenHeader>

                <ContentInitialBanner>
                    {generateInitialBanner()}
                </ContentInitialBanner>

                <ContentCardsList>
                    <ShrimpCardList
                        dataPublication={getDataPublication()}
                        dataAdvertising={dataAdvertising}
                        sharedRef={viewShotShrimpCardRef}
                        openModal={() => setModalVisible(true)}
                        onEndReached={handleEndReached}
                        isNextLoading={loadingNextPublications}
                        isNestEnd={showEndPublications}
                    />
                </ContentCardsList>

                <PublicShrimpButton onPress={handleRedirectPublishShrimp}>
                    <ShrimpIcon source={shrimpIconWhite} />
                    <TextButton>Publicar meu Camarão</TextButton>
                </PublicShrimpButton>

                <FilterContent
                    width={width}
                    showFilter={showFilter}
                    onClose={handleCloseFilter}
                    onClear={handleClearFilter}
                    hideData={hidedataFilter}
                    dataFilter={dataPublication}
                    actionFilter={handleFilter}
                />
                <ShrimpCardShared shrimpCardRef={viewShotShrimpCardRef} />
            </Container>
            <SelectAccountModal
                modalVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                action={() => setShowAlertUserType(true)}
            />
            <DialogComponent
                visible={showAlertVisible}
                title="Conclua seu cadastro"
                text="Para publicar camarões é necessário concluir seu cadastro como produtor(a)!"
                textActionButton="Concluir cadastro"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={() => handleOpenModalConcludedRegister()}
                dismissable={false}
            />
            <ModalConcludedRegister
                isVisible={showModalConcludedRegister}
                onClose={() => setShowModalConcludedRegister(false)}
            />
            <ModalUpdateClientLocation
                isVisible={showModalUpdateClientLocation}
                onClose={() => setShowModalUpdateClientLocation(false)}
            />
            <DialogComponent
                visible={showAlertUserType}
                title="Selecione quem será cadastrado!"
                text="Antes de se cadastrar nos informe quem você é!"
                hideDialog={() => setShowAlertUserType(false)}
                textActionButton="Sou Produtor"
                actionButton={() => handleRedirectProductorRegister()}
                textSecondaryActionButton="Sou Cliente"
                secondaryActionButton={() => handleRedirectClientRegister()}
                dismissable={false}
            />
        </>
    );
};
