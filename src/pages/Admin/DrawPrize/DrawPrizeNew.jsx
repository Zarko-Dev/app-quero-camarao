import { ActivityIndicator, Checkbox } from "react-native-paper";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import SelectComponent from "../../../components/SelectComponent";
import { firestore } from "../../../services/Firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import { Alert } from "react-native";

import {
    ButtonDrawPrise,
    ButtonDrawPriseHistory,
    Container,
    ContentTag,
    ContentTags,
    ContentTagParticipant,
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

// limpa a tela
useFocusEffect(
    useCallback(() => {
        return () => {
            setSelectedRule(null)
            setParticipantsWithNames([])
        }
    }, []),
)

const handleDrawPrize = async () => {
    if (!selectedRule) return

    const cpfsPool = selectedRule.cpfs.filter(u => {
        if (!u.blocked) return true
        return new Date() > u.blockedUntil.toDate()
    })

    if (cpfsPool.length === 0) {
        Alert.alert("Atenção", "Nenhum participante disponível para o sorteio.")
        return
    }

    // embaralha e pega 1 ganhador
    const shuffled = [...cpfsPool].sort(() => Math.random() - 0.5)
    const winner = shuffled[0]

    // bloqueia o ganhador por 12 meses
    const blockedUntil = new Date()
    blockedUntil.setFullYear(blockedUntil.getFullYear() + 1)

    const updatedCpfs = selectedRule.cpfs.map(u => {
        if (u.cpf === winner.cpf) {
            return { ...u, blocked: true, blockedUntil }
        }
        return u
    })

    await blockWinners(selectedRule.firestoreId, updatedCpfs)

    navigation.navigate(dataRoutes.admin.drawPrizeNewWinnerResult, {
        usersWinner: [winner],
    })
}

    const handleRedirectDrawPrizeHistory = () => {
        navigation.navigate(dataRoutes.admin.drawPrizeHistory)
    }

    // Traz para o sorteio somente participantes que nao foram sorteados ainda e  sem duplicações
  const loadParticipantNames = async (rule) => {
    try {
        const seenCpfs = new Set()

        const availableCpfs = rule.cpfs
            .filter(u => !u.blocked)
            .filter(u => {
                if (seenCpfs.has(u.cpf)) return false
                seenCpfs.add(u.cpf)
                return true
            })
            .slice(0, 30)  // ← só os primeiros 30 únicos

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
// deleta regra
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

{/* Botão delete aparece só quando uma regra está selecionada */}
{selectedRule && (
    <ButtonDeleteRule onPress={() => handleDeleteRule(selectedRule)}>
        <FontAwesome name="trash" size={18} color="white" />
        <TextButtonDrawPrize> Excluir Regra</TextButtonDrawPrize>
    </ButtonDeleteRule>
)}

        {selectedRule && (
             <>
        <Subtitle>Participantes</Subtitle>
            <ScrollNewPrize>
                <ContentTags>
                    {participantsWithNames.map((user, index) => (
                        <ContentTagParticipant key={`${user.cpf}-${index}`}>
                            <TagParticipant>{user.name} — {user.cpf}</TagParticipant>
                        </ContentTagParticipant>
                    ))}
                </ContentTags>
            </ScrollNewPrize>
            </>
        )}

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