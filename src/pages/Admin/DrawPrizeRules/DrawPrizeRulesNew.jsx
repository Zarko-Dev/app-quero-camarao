import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { saveUsersDrawPrizeRules } from "../../../controllers/DrawPrizes/rules";
import SelectComponent from "../../../components/SelectComponent";
import { firestore } from "../../../services/Firebase";
import { FontAwesome } from "@expo/vector-icons";
import { Checkbox } from "react-native-paper";
import { Alert, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"
import {
    ButtonRemoveTag,
    ClearAll,
    ConfirmeButtom,
    Container,
    Content,
    ContentActions,
    ContentButtons,
    ContentTagParticipant,
    ContentTags,
    TagParticipant,
    Scroll,
    Subtitle,
    ContentCheckboxMode,
    CheckboxModeItem,
    CheckboxAllLabel,
    TextButton,
    Title,
    TitleSelect,
    TitleTags,
} from "./styles";

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export const DrawPrizeRulesNew = () => {

  const [ruleName, setRuleName]           = useState("")
  const [stateOptions, setStateOptions]   = useState([])   // estados vindos do Firestore
  const [cityOptions, setCityOptions]     = useState([])
  const [cpfOptions, setCpfOptions]       = useState([])
  const [allUsersLabels, setAllUsersLabels] = useState([])
  const [selectedAll, setSelectedAll]     = useState(false)
  const [modeAll, setModeAll]             = useState(false)
  const [selectedStates, setSelectedStates] = useState([])
  const [selectedCities, setSelectedCities] = useState([])
  const [selectedCpfs, setSelectedCpfs]   = useState([])
  const [allClientsLabels, setAllClientsLabels] = useState([])
  const [allProductorsLabels, setAllProductorsLabels] = useState([])
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingCpfs, setLoadingCpfs]     = useState(false)

const cpfLabels = cpfOptions
  .filter(c => c?.label && typeof c.label === "string" && c.userType === 'productor')
  .map(c => c.label)

  const produtores = selectedCpfs.filter(
  c => typeof c === "string" && c.includes("(Produtor)")
)

const clientes = selectedCpfs.filter(
  c => typeof c === "string" && c.includes("(Cliente)")
)

  // Ao montar: busca estados distintos + todos os usuários (para modo "Todos")
  useEffect(() => {
    loadStates()
    loadAllUsers()
  }, [])

  // Quando estados selecionados mudam â†’ busca cidades
  useEffect(() => {
    if (selectedStates.length > 0) {
      loadCitiesByStates(selectedStates)
    } else {
      setCityOptions([])
      setSelectedCities([])
      setCpfOptions([])
      setSelectedCpfs([])
    }
  }, [selectedStates])

  // Quando cidades selecionadas mudam â†’ busca CPFs
  useEffect(() => {
    if (selectedCities.length > 0) {
      loadCpfsByCities(selectedCities)
    } else {
      setCpfOptions([])
      setSelectedCpfs([])
    }
  }, [selectedCities])

 useFocusEffect(
  useCallback(() => {
    loadStates()      // âœ… recarrega ao entrar
    loadAllUsers()    // âœ… recarrega ao entrar
    return () => { handleClearAll() }
  }, [])
)

  // Busca todos os estados distintos dos usuários
  const loadStates = async () => {
    setLoadingStates(true)
    try {
      const snapshot = await getDocs(collection(firestore, "users"))
      const states = new Set()
      snapshot.docs.forEach(doc => {
        const state = doc.data().state
        if (state) states.add(state)
      })
      setStateOptions([...states].sort())
    } catch (error) {
      console.log("Erro ao buscar estados:", error)
    } finally {
      setLoadingStates(false)
    }
  }

  // Busca cidades distintas dos estados selecionados
  const loadCitiesByStates = async (states) => {
    setLoadingCities(true)
    setSelectedCities([])
    setCpfOptions([])
    setSelectedCpfs([])
    try {
      const q = query(
        collection(firestore, "users"),
        where("state", "in", states)
      )
      const snapshot = await getDocs(q)
      const cities = new Set()
      snapshot.docs.forEach(doc => {
        const city = doc.data().city
        if (city) cities.add(city)
      })
      setCityOptions([...cities].sort())
    } catch (error) {
      console.log("Erro ao buscar cidades:", error)
    } finally {
      setLoadingCities(false)
    }
  }

  // Busca usuários das cidades selecionadas (excluindo bloqueados)
  const loadCpfsByCities = async (cities) => {
    setLoadingCpfs(true)
    setSelectedCpfs([])
    try {
      const [usersSnap, rulesSnap] = await Promise.all([
        getDocs(query(collection(firestore, "users"), where("city", "in", cities))),
        getDocs(collection(firestore, "newDrawPrizeRules"))
      ])

      const blockedCpfs = new Set()
      rulesSnap.forEach(doc => {
        const cpfs = doc.data().cpfs || []
        cpfs.forEach(u => {
          if (u.blocked) {
            const until = u.blockedUntil?.toDate ? u.blockedUntil.toDate() : new Date(u.blockedUntil)
            if (new Date() < until) blockedCpfs.add(u.cpf)
          }
        })
      })

      const seenCpfs = new Set()
      const options = usersSnap.docs
        .map(doc => {
          const data = doc.data()
          return {
            label: `${data.name} - ${data.cpf} (${translateUserType(data.userType)})`,
            value: data.cpf,
            userType: data.userType
          }
        })
        .filter(u => !blockedCpfs.has(u.value))
        .filter(u => {
          if (seenCpfs.has(u.value)) return false
          seenCpfs.add(u.value)
          return true
        })

      setCpfOptions(options)

      // Marca produtores automaticamente
      const produtores = options
        .filter(u => u.userType === 'productor') // ajusta o valor conforme seu sistema
        .map(u => u.label)
      setSelectedCpfs(produtores)
    } catch (error) {
      console.log("Erro ao buscar participantes:", error)
    } finally {
      setLoadingCpfs(false)
    }
  }

  // Busca todos os usuários para o modo "Todos os Participantes"
 const loadAllUsers = async () => {
  try {
    const [usersSnap, rulesSnap] = await Promise.all([
      getDocs(collection(firestore, "users")),
      getDocs(collection(firestore, "newDrawPrizeRules"))
    ])

    const blockedCpfs = new Set()
    rulesSnap.forEach(doc => {
      const cpfs = doc.data().cpfs || []
      cpfs.forEach(u => {
        if (u.blocked) {
          const until = u.blockedUntil?.toDate ? u.blockedUntil.toDate() : new Date(u.blockedUntil)
          if (new Date() < until) blockedCpfs.add(u.cpf)
        }
      })
    })

    const seenCpfs = new Set()
    const allUsers = usersSnap.docs
      .map(doc => doc.data())
      .filter(u => !blockedCpfs.has(u.cpf))
      .filter(u => {
        if (seenCpfs.has(u.cpf)) return false
        seenCpfs.add(u.cpf)
        return true
      })

    setAllUsersLabels(allUsers.map(u => `${u.name} - ${u.cpf} (${translateUserType(u.userType)})`))
    setAllClientsLabels(allUsers.filter(u => u.userType === "client").map(u => `${u.name} - ${u.cpf} (${translateUserType(u.userType)})`))
    setAllProductorsLabels(allUsers.filter(u => u.userType === "productor").map(u => `${u.name} - ${u.cpf} (${translateUserType(u.userType)})`))

  } catch (error) {
    console.log("Erro ao buscar todos os usuários:", error)
  }
}

  const translateUserType = (userType) => {
    const types = { productor: "Produtor", client: "Cliente" }
    return types[userType] || userType
  }

  const handleClearAll = () => {
    setRuleName("")
    setSelectedStates([])
    setSelectedCities([])
    setSelectedCpfs([])
    setCityOptions([])
    setCpfOptions([])
    setAllClientsLabels([])
    setAllProductorsLabels([])
    setSelectedAll(false)
    setModeAll(false)
     loadAllUsers()  // âœ… recarrega os usuários após limpar
     loadStates()    // âœ… recarrega os estados após limpar
  }

  const handleSaveAll = async () => {
    if (!ruleName.trim()) {
      Alert.alert("Atenção", "Informe um nome para a regra.")
      return
    }
    if (selectedCpfs.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um participante.")
      return
    }
    try {
      const cpfsToSave = selectedCpfs.map(label => {
        const [, rest] = label.split(" - ")
        const cpf = rest?.split(" ")[0]
        const userType = rest?.includes("Produtor") ? "productor" : "client"
        return { cpf, userType, blocked: false, blockedUntil: null }
      })

      const result = await saveUsersDrawPrizeRules({
        id: generateId(),
        name: ruleName.trim(),
        store: ruleName.trim(),
        states: [],
        cities: [],
        cpfs: cpfsToSave
      })

      if (result) {
        Alert.alert("Sucesso!", "Regra salva com sucesso.")
        handleClearAll()
      } else {
        Alert.alert("Erro", "Não foi possível salvar a regra. Tente novamente.")
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao salvar. Tente novamente.")
      console.log("Erro ao salvar:", error)
    }
  }

  const handleSave = async () => {
    if (!ruleName.trim()) {
      Alert.alert("Atenção", "Informe um nome para a regra.")
      return
    }
    if (selectedStates.length === 0 || selectedCities.length === 0) {
      Alert.alert("Campos obrigatórios", "Selecione pelo menos um estado e uma cidade.")
      return
    }
    try {
      const cpfsToSave = selectedCpfs.length > 0
        ? cpfOptions
            .filter(c => selectedCpfs.includes(c.label))
            .map(c => ({ cpf: c.value, userType: c.userType, blocked: false, blockedUntil: null }))
        : cpfOptions.map(c => ({ cpf: c.value, userType: c.userType, blocked: false, blockedUntil: null }))

      const result = await saveUsersDrawPrizeRules({
        id: generateId(),
        name: ruleName.trim(),
        store: ruleName.trim(), // mantém compatibilidade
        states: selectedStates,
        cities: selectedCities,
        cpfs: cpfsToSave
      })

      if (result) {
        Alert.alert("Sucesso!", "Regra salva com sucesso.")
        handleClearAll()
      } else {
        Alert.alert("Erro", "Não foi possível salvar a regra. Tente novamente.")
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao salvar. Tente novamente.")
      console.log("Erro ao salvar:", error)
    }
  }

  return (
    <Container>
    <Scroll>
      <Content>

        <Title>Regras de Sorteio</Title>

        {/* CHECKBOXES DE MODO */}
        <ContentCheckboxMode>
          <CheckboxModeItem onPress={() => {
            setModeAll(false)
            setSelectedCpfs([])
            setSelectedAll(false)
          }}>
            <Checkbox.Android status={!modeAll ? "checked" : "unchecked"} />
            <CheckboxAllLabel>Por Estado / Cidade</CheckboxAllLabel>
          </CheckboxModeItem>

          <CheckboxModeItem onPress={() => {
            setModeAll(true)
            setSelectedStates([])
            setSelectedCities([])
            setCityOptions([])
            setCpfOptions([])
            setSelectedCpfs([])
          }}>
            <Checkbox.Android status={modeAll ? "checked" : "unchecked"} />
            <CheckboxAllLabel>Todos os Participantes</CheckboxAllLabel>
          </CheckboxModeItem>
        </ContentCheckboxMode>

        {/* MODO TODOS */}
        {modeAll && (
          <>
            <TitleSelect>Nome da Regra</TitleSelect>
            <TextInput
              placeholder="Ex: Sorteio Outubro 2025"
              value={ruleName}
              onChangeText={setRuleName}
              style={{
                borderWidth: 1.5,
                borderColor: "#E8572A",
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                fontSize: 14,
                backgroundColor: "#fff7f2",
              }}
            />
            <Subtitle>Selecione todos os participantes de uma vez só</Subtitle>

           <TitleSelect>Todos os Participantes</TitleSelect>
              <SelectComponent
                title="Selecionar Todos"
                options={allUsersLabels}
                action={(values) => {
                  const arr = Array.isArray(values) ? values : typeof values === "string" ? [values] : []
                  setSelectedAll(arr.length > 0)
                  setSelectedCpfs([...new Set(arr)])
                }}
                multipleSelect
                clear={!selectedAll}
              />

           <TitleSelect>Somente Clientes</TitleSelect>
              <SelectComponent
                title="Selecionar Clientes"
                options={allClientsLabels}
                action={(values) => {
                  const arr = Array.isArray(values) ? values : typeof values === "string" ? [values] : []
                  setSelectedCpfs(prev => {
                    const withoutClients = prev.filter(v => !allClientsLabels.includes(v))
                    return [...new Set([...withoutClients, ...arr])]
                  })
                }}
                multipleSelect
                clear={allClientsLabels.length === 0}
              />

          <TitleSelect>Somente Produtores</TitleSelect>
                <SelectComponent
                  title="Selecionar Produtores"
                  options={allProductorsLabels}
                  action={(values) => {
                    const arr = Array.isArray(values) ? values : typeof values === "string" ? [values] : []
                    setSelectedCpfs(prev => {
                      const withoutProductors = prev.filter(v => !allProductorsLabels.includes(v))
                      return [...new Set([...withoutProductors, ...arr])]
                    })
                  }}
                  multipleSelect
                  clear={allProductorsLabels.length === 0}
                />
          </>
        )}

        {/* MODO ESTADO / CIDADE */}
        {!modeAll && (
          <>
            <TitleSelect>Nome da Regra</TitleSelect>
            <TextInput
              placeholder="Ex: Sorteio Setembro 2025"
              value={ruleName}
              onChangeText={setRuleName}
              style={{
                borderWidth: 1.5,
                borderColor: "#E8572A",
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                fontSize: 14,
                backgroundColor: "#fff7f2",
              }}
            />
            <Subtitle>Selecione o estado, cidades e participantes do sorteio</Subtitle>

            <TitleSelect>Estado</TitleSelect>
            {loadingStates ? (
              <Subtitle>Carregando estados...</Subtitle>
            ) : (
              <SelectComponent
                title="Selecionar Estado"
                options={stateOptions}
                action={(values) => setSelectedStates([...new Set(values)])}
                multipleSelect
                clear={selectedStates.length === 0}
              />
            )}

            <TitleSelect>Cidades</TitleSelect>
            {loadingCities ? (
              <Subtitle>Carregando cidades...</Subtitle>
            ) : (
              <SelectComponent
                title="Selecionar Cidades"
                options={cityOptions}
                action={setSelectedCities}
                multipleSelect
                disabled={selectedStates.length === 0}
                clear={selectedCities.length === 0}
              />
            )}

            <TitleSelect>Participantes</TitleSelect>
            {loadingCpfs ? (
              <Subtitle>Carregando participantes...</Subtitle>
            ) : (
              <SelectComponent
                title="Selecionar Participantes"
                options={cpfLabels}
                action={(values) => setSelectedCpfs([...new Set(values)])}
                multipleSelect
                disabled={selectedCities.length === 0}
                clear={cpfLabels.length === 0}
                selectedValues={selectedCpfs}
              />
            )}
          </>
        )}

        {/* Tags dos participantes selecionados */}
<TitleTags>Participantes Selecionados</TitleTags>

{selectedCpfs.length === 0 ? (
  <Subtitle>Nenhum participante selecionado</Subtitle>
) : (
  <>
    {/* PRODUTORES */}
    {produtores.length > 0 && (
      <>
        <TitleSelect>Produtores</TitleSelect>
        <ContentTags>
          {produtores.map((cpf, index) => (
            <ContentTagParticipant key={`${cpf}-${index}`}>
              <TagParticipant>{String(cpf || "")}</TagParticipant>
              <ButtonRemoveTag
                onPress={() =>
                  setSelectedCpfs(prev => prev.filter(c => c !== cpf))
                }
              >
                <FontAwesome name="remove" size={18} color="white" />
              </ButtonRemoveTag>
            </ContentTagParticipant>
          ))}
        </ContentTags>
      </>
    )}

    {/* CLIENTES */}
    {clientes.length > 0 && (
      <>
        <TitleSelect>Clientes</TitleSelect>
        <ContentTags>
          {clientes.map((cpf, index) => (
            <ContentTagParticipant key={`${cpf}-${index}`}>
              <TagParticipant>{String(cpf || "")}</TagParticipant>
              <ButtonRemoveTag
                onPress={() =>
                  setSelectedCpfs(prev => prev.filter(c => c !== cpf))
                }
              >
                <FontAwesome name="remove" size={18} color="white" />
              </ButtonRemoveTag>
            </ContentTagParticipant>
          ))}
        </ContentTags>
      </>
    )}
  </>
)}

        {/* BOTÕES SEMPRE VISÍVEIS NO FINAL */}
        <ContentButtons>
          <ContentActions>
            <ClearAll onPress={handleClearAll}>
              <TextButton>Limpar Tudo</TextButton>
            </ClearAll>
            <ConfirmeButtom onPress={modeAll ? handleSaveAll : handleSave}>
              <TextButton>Salvar Regra</TextButton>
            </ConfirmeButtom>
          </ContentActions>
        </ContentButtons>

      </Content>
    </Scroll>
  </Container>
)
}
