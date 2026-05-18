import { ActivityIndicator, Checkbox } from "react-native-paper";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import SelectComponent from "../../../components/SelectComponent";
import { firestore } from "../../../services/Firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FontAwesome, Feather } from "@expo/vector-icons";
import { Alert } from "react-native";
import { saveDrawPrize } from "../../../controllers/DrawPrizes/create";


import {
    ActionCountButton,
    ButtonDrawPrise,
    ButtonDrawPriseHistory,
    CardSelection,
    Container,
    ContentActionCountButtons,
    ContentTag,
    ContentTags,
    ContentTagParticipant,
    CountTitle,
    ScrollNewPrize,
    Subtitle,
    Tag,
    TextButtonDrawPrize,
    ButtonDeleteRule,
    Title,
} from "./styles";
import { dataRoutes } from "../../../routes/dataRoutes";
import { TagParticipant } from "../DrawPrizeRules/styles";
import { getNewDrawPrizeRules, blockWinners, deleteDrawPrizeRule } from "../../../controllers/DrawPrizes/rules";


export const DrawPrizeNew = ({ navigation }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [dataRules, setDataRules] = useState([]);
    const [selectedRule, setSelectedRule] = useState(null);
    const [participantsWithNames, setParticipantsWithNames] = useState([])
    const [countPrizes, setCountPrizes] = useState(1)

    const limitDrawPrizes = 99

    useFocusEffect(
        useCallback(() => {
            const loadRules = async () => {
                const data = await getNewDrawPrizeRules()
                setDataRules(data)
                setIsLoading(false)
            }

            setIsLoading(true)
            loadRules()
        }, []),
    );

    useFocusEffect(
        useCallback(() => {
            return () => {
                setSelectedRule(null)
                setParticipantsWithNames([])
                setCountPrizes(1)
            }
        }, []),
    )

    const addCountPrizes = () => {
        if (countPrizes < limitDrawPrizes) {
            setCountPrizes(count => count + 1)
        }
    }

    const removeCountPrizes = () => {
        if (countPrizes > 1) {
            setCountPrizes(count => count - 1)
        }
    }

    const handleDrawPrize = async () => {
        if (!selectedRule) return

        const cpfsPool = selectedRule.cpfs.filter(u => {
            if (!u.cpf) return false
            if (!u.blocked) return true
            return new Date() > u.blockedUntil.toDate()
        })

        if (cpfsPool.length === 0) {
            Alert.alert("Atenção", "Nenhum participante disponível para o sorteio.")
            return
        }

        if (cpfsPool.length < countPrizes) {
            Alert.alert("Atenção", `Participantes disponíveis (${cpfsPool.length}) são menos que o número de ganhadores (${countPrizes}).`)
            return
        }

        const shuffled = [...cpfsPool].sort(() => Math.random() - 0.5)
        const winners = shuffled.slice(0, countPrizes)

        try {
            const cpfList = winners.map(w => w.cpf)

            const q = query(
                collection(firestore, "users"),
                where("cpf", "in", cpfList)
            )
            const snapshot = await getDocs(q)

            if (snapshot.empty) {
                Alert.alert("Erro", "Não foi possível encontrar os dados dos ganhadores.")
                return
            }

            const usersData = snapshot.docs.map(doc => doc.data())

            const winnersFullData = winners
                .map(w => usersData.find(u => u.cpf === w.cpf))
                .filter(u => u && u.cpf && u.name)

            if (winnersFullData.length === 0) {
                Alert.alert("Atenção", "Ganhadores com cadastro incompleto.")
                return
            }

            const blockedUntil = new Date()
            blockedUntil.setFullYear(blockedUntil.getFullYear() + 1)

            const updatedCpfs = selectedRule.cpfs.map(u => {
                if (cpfList.includes(u.cpf)) {
                    return { ...u, blocked: true, blockedUntil }
                }
                return u
            })

            await blockWinners(selectedRule.firestoreId, updatedCpfs)

            // âœ… salva no histórico automaticamente
            await saveDrawPrize(selectedRule.store, winnersFullData, null)

            navigation.navigate(dataRoutes.admin.drawPrizeWinnerResult, {
                usersWinner: winnersFullData,
            })
        } catch (error) {
            console.log("Erro ao buscar ganhadores:", error)
            Alert.alert("Erro", "Ocorreu um erro ao realizar o sorteio.")
        }
    }

    const handleRedirectDrawPrizeHistory = () => {
        navigation.navigate(dataRoutes.admin.drawPrizeHistory)
    }

    const loadParticipantNames = async (rule) => {
        try {
            const seenCpfs = new Set()

            const availableCpfs = rule.cpfs
                .filter(u => !u.blocked)
                .filter(u => !!u.cpf)
                .filter(u => {
                    if (seenCpfs.has(u.cpf)) return false
                    seenCpfs.add(u.cpf)
                    return true
                })
                .slice(0, 30)

            const cpfList = availableCpfs.map(u => u.cpf)

            const q = query(
                collection(firestore, "users"),
                where("cpf", "in", cpfList)
            )

            const snapshot = await getDocs(q)
            const users = snapshot.docs.map(doc => doc.data())

            const merged = availableCpfs.map(u => {
                const found = users.find(user => user.cpf === u.cpf)
                return {
                    cpf: u.cpf,
                    userType: u.userType,
                    name: found?.name || "Nome não encontrado"
                }
            })

            setParticipantsWithNames(merged)
        } catch (error) {
            console.log("Erro ao buscar nomes:", error)
        }
    }

    const handleDeleteRule = async (rule) => {
        Alert.alert(
            "Excluir Regra",
            `Deseja excluir a regra ${rule.store}?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        const result = await deleteDrawPrizeRule(rule.firestoreId)
                        if (result) {
                            setDataRules(prev => prev.filter(r => r.firestoreId !== rule.firestoreId))
                            if (selectedRule?.firestoreId === rule.firestoreId) {
                                setSelectedRule(null)
                                setParticipantsWithNames([])
                            }
                        }
                    }
                }
            ]
        )
    }

    return (
        <Container>
            <Title>Sorteio</Title>

            <SelectComponent
                title="Selecionar Regra"
                options={dataRules
                    .filter(r => r.cpfs && r.cpfs.some(u => !u.blocked))
                    .map((r, index) => `${r.store} (${index + 1})`)}
                action={(value) => {
                    const index = parseInt(value.match(/\((\d+)\)/)?.[1]) - 1
                    const filteredRules = dataRules.filter(r => r.cpfs && r.cpfs.some(u => !u.blocked))
                    const rule = filteredRules[index]
                    setSelectedRule(rule)
                    loadParticipantNames(rule)
                }}
            />

            {selectedRule && (
                <ButtonDeleteRule onPress={() => handleDeleteRule(selectedRule)}>
                    <FontAwesome name="trash" size={18} color="white" />
                    <TextButtonDrawPrize> Excluir Regra</TextButtonDrawPrize>
                </ButtonDeleteRule>
            )}


            <Subtitle>Informe quantos serão sorteados!</Subtitle>
            <CardSelection>
                <CountTitle>{countPrizes}</CountTitle>
                <ContentActionCountButtons>
                    <ActionCountButton
                        disabled={countPrizes === 1}
                        onPress={removeCountPrizes}
                    >
                        <Feather name="minus" size={24} color="black" />
                    </ActionCountButton>
                    <ActionCountButton
                        green
                        disabled={countPrizes === limitDrawPrizes}
                        onPress={addCountPrizes}
                    >
                        <Feather name="plus" size={24} color="black" />
                    </ActionCountButton>
                </ContentActionCountButtons>
            </CardSelection>

            <ButtonDrawPrise
                disabled={isLoading || !selectedRule}
                onPress={handleDrawPrize}
            >
                {!isLoading ? (
                    <TextButtonDrawPrize>Sortear</TextButtonDrawPrize>
                ) : (
                    <ActivityIndicator animating color="white" />
                )}
            </ButtonDrawPrise>

            <ButtonDrawPriseHistory onPress={handleRedirectDrawPrizeHistory}>
                <TextButtonDrawPrize>Histórico de Sorteios</TextButtonDrawPrize>
            </ButtonDrawPriseHistory>
        </Container>
    )
}