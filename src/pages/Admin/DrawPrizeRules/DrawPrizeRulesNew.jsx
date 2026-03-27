import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { saveUsersDrawPrizeRules } from "../../../controllers/DrawPrizes/rules";
import SelectComponent from "../../../components/SelectComponent";
import { firestore } from "../../../services/Firebase";
import { FontAwesome } from "@expo/vector-icons";
import { Checkbox } from "react-native-paper";



import { Alert } from "react-native";
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
    SaveDrawPriseRule,
    Scroll,
    Subtitle,
    ContentCheckboxMode,
    CheckboxModeItem,
    CheckboxAllLabel,
    Tag,
    TextButton,
    Title,
    TitleSelect,
    TitleTags,
} from "./styles";

const STORES = [
  { label: "Ag Ração",   value: "71b69fd9-0075-4442-9fb0-269365324792", cities: ["São João do Jaguaribe"] },

  { label: "Nutrial",    value: "82242fc7-8c5c-40d4-ae89-74445177f0a1", cities: ["Fortim","Beberibe","Aracati","Icapuí","Itaiçaba","Palhano","Jaguaruana","Russas","Quixeré","Limoeiro do Norte","Morada Nova","Tabuleiro do Norte","São João do Jaguaribe","Alto Santo","Jaguaribe"] },

  { label: "Brx",        value: "548ec42e-e32f-4722-8cd8-809ac503f0c0", cities: ["Fortim","Beberibe","Aracati","Icapuí","Itaiçaba","Palhano","Jaguaruana","Russas","Quixeré","Limoeiro do Norte","Morada Nova","Tabuleiro do Norte","São João do Jaguaribe","Alto Santo","Jaguaribe"] },

  { label: "TCP",        value: "d07c2c49-3fb3-458c-be5a-a2c122bd9945", cities: ["Fortim","Beberibe","Aracati","Icapuí","Itaiçaba","Palhano","Jaguaruana","Russas","Quixeré","Limoeiro do Norte","Morada Nova","Tabuleiro do Norte","São João do Jaguaribe","Alto Santo","Jaguaribe"] },

  { label: "Aplicativo", value: "8f692b71-a400-4cdc-b2a4-68b57c173833", cities: ["Fortim","Beberibe","Aracati","Icapuí","Itaiçaba","Palhano","Jaguaruana","Russas","Quixeré","Limoeiro do Norte","Morada Nova","Tabuleiro do Norte","São João do Jaguaribe","Alto Santo","Jaguaribe"] },
]

// Array de strings para o SelectComponent
const STORE_NAMES = STORES.map(s => s.label)

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}


export const DrawPrizeRulesNew = () => {

 
  const [cityOptions, setCityOptions] = useState([])
  const [cpfOptions, setCpfOptions] = useState([])
  const [selectedAll, setSelectedAll] = useState(false)
  const [allUsersLabels, setAllUsersLabels] = useState([])
  const [modeAll, setModeAll] = useState(false)
  const [selectedStore, setSelectedStore] = useState(null)
  const [selectedCities, setSelectedCities] = useState([])
  const [selectedCpfs, setSelectedCpfs] = useState([])

  const [loadingCpfs, setLoadingCpfs] = useState(false)

  const cpfLabels = cpfOptions.map(c => c.label)

  // busca todos os usuários ao montar o componente
  useEffect(() => {
  loadAllUsers()
  }, [])

  // Busca CPFs sempre que cidades selecionadas mudarem
  useEffect(() => {
    if (selectedCities.length > 0) {
      loadCpfsByCities(selectedCities)
    } else {
      setCpfOptions([])
      setSelectedCpfs([])
    }
  }, [selectedCities])

  useEffect(() => {
  return () => {
    handleClearAll()
  }
}, [])

 const handleSelectStore = (storeName) => {
  const store = STORES.find(s => s.label === storeName)

  setSelectedStore(store)
  setSelectedCities([])
  setSelectedCpfs([])
  setCityOptions(store.cities)  // já são strings simples
}

//Traz todos os usuários de uma vez só
const loadAllUsers = async () => {
  try {
    const rulesSnapshot = await getDocs(collection(firestore, "newDrawPrizeRules"))
    const blockedCpfs = []
    rulesSnapshot.forEach(doc => {
      const cpfs = doc.data().cpfs || []
      cpfs.forEach(u => {
        if (u.blocked) {
          const until = u.blockedUntil?.toDate ? u.blockedUntil.toDate() : new Date(u.blockedUntil)
          if (new Date() < until) blockedCpfs.push(u.cpf)
        }
      })
    })

    const snapshot = await getDocs(collection(firestore, "users"))
    
    const seenCpfs = new Set()  // ← controla CPFs já vistos

    const labels = snapshot.docs
      .map(doc => doc.data())
      .filter(u => !blockedCpfs.includes(u.cpf))
      .filter(u => {
        if (seenCpfs.has(u.cpf)) return false  // ← remove duplicata
        seenCpfs.add(u.cpf)
        return true
      })
      .map(u => `${u.name} - ${u.cpf} (${translateUserType(u.userType)})`)

    setAllUsersLabels(labels)
  } catch (error) {
    console.log("Erro ao buscar todos usuários:", error)
  }
}


const loadCpfsByCities = async (cities) => {
  setLoadingCpfs(true)
  setSelectedCpfs([])

  try {
    const q = query(
      collection(firestore, "users"),
      where("city", "in", cities)
    )

    const snapshot = await getDocs(q)

    const rulesSnapshot = await getDocs(collection(firestore, "newDrawPrizeRules"))
    const blockedCpfs = []

    rulesSnapshot.forEach(doc => {
      const cpfs = doc.data().cpfs || []
      cpfs.forEach(u => {
        if (u.blocked) {
          const until = u.blockedUntil?.toDate ? u.blockedUntil.toDate() : new Date(u.blockedUntil)
          if (new Date() < until) blockedCpfs.push(u.cpf)
        }
      })
    })

    const options = snapshot.docs
      .map(doc => {
        const data = doc.data()
        return {
          label: `${data.name} - ${data.cpf} (${translateUserType(data.userType)})`,
          value: data.cpf,
          userType: data.userType
        }
      })
      .filter(u => !blockedCpfs.includes(u.value))

    setCpfOptions(options)
  } catch (error) {
    console.log("Erro ao buscar usuários:", error)
  } finally {
    setLoadingCpfs(false)
  }
}
// traduz client e productor para cliente e produtor
const translateUserType = (userType) => {
  const types = {
    productor: "Produtor",
    client: "Cliente"
  }
  return types[userType] || userType
}

 


 const handleClearAll = () => {
  setSelectedStore(null)
  setSelectedCities([])
  setSelectedCpfs([])
  setCityOptions([])
  setCpfOptions([])
  setSelectedAll(false)
  setModeAll(false)
}

  // Usado pra salvar regra no caso de ser todos os participantes
  const handleSaveAll = async () => {
  if (selectedCpfs.length === 0) {
    Alert.alert("Atenção", "Selecione pelo menos um participante.")
    return
  }

  try {
    const cpfsToSave = selectedCpfs.map(label => {
      const [namePart, rest] = label.split(" - ")
      const cpf = rest?.split(" ")[0]
      const userType = rest?.includes("Produtor") ? "productor" : "client"
      return { cpf, userType, blocked: false, blockedUntil: null }
    })

    const ruleData = {
      id: generateId(),
      store: "Todos",
      cities: [],
      cpfs: cpfsToSave
    }

    const result = await saveUsersDrawPrizeRules(ruleData)

    if (result) {
      Alert.alert("Sucesso!", "Regra de sorteio salva com sucesso.")
      handleClearAll()
    } else {
      Alert.alert("Erro", "Não foi possível salvar a regra. Tente novamente.")
    }
  } catch (error) {
    Alert.alert("Erro", "Ocorreu um erro ao salvar. Tente novamente.")
    console.log("Erro ao salvar:", error)
  }
}


 // Usado pra salvar regra no caso de ser a opção loja > cidade > cpfs
 const handleSave = async () => {
  if (!selectedStore || selectedCities.length === 0) {
    Alert.alert("Campos obrigatórios", "Selecione a loja e pelo menos uma cidade para continuar.")
    return
  }

  try {// pega o cpf de cada usuario produtor ou cliente por loja e coloca um bloqueio caso seja o ganhador
  const cpfsToSave = selectedCpfs.length > 0
  ? cpfOptions
      .filter(c => selectedCpfs.includes(c.label))
      .map(c => ({ 
        cpf: c.value, 
        userType: c.userType,
        blocked: false,
        blockedUntil: null
      }))
  : cpfOptions.map(c => ({ 
      cpf: c.value, 
      userType: c.userType,
      blocked: false,
      blockedUntil: null
    }))

    const ruleData = {
      id: generateId(), 
      store: selectedStore.label,
      cities: selectedCities,
      cpfs: cpfsToSave
    }

    const result = await saveUsersDrawPrizeRules(ruleData)

    if (result) {
      Alert.alert("Sucesso!", "Regra de sorteio salva com sucesso.")
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
            <CheckboxAllLabel>Por Loja / Cidade</CheckboxAllLabel>
          </CheckboxModeItem>

          <CheckboxModeItem onPress={() => {
            setModeAll(true)
            setSelectedStore(null)
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
            <Subtitle>Selecione todos os participantes de uma vez só</Subtitle>
            <TitleSelect>Todos os Participantes</TitleSelect>
            <SelectComponent
              title="Selecionar Todos"
              options={allUsersLabels}
              action={(values) => {
                setSelectedAll(values.length > 0)
                setSelectedCpfs([...new Set(values)])
              }}
              multipleSelect
              clear={!selectedAll}
            />
          </>
        )}

        {/* MODO LOJA/CIDADE */}
        {!modeAll && (
          <>
            <Subtitle>Selecione a loja, cidades e participantes do sorteio</Subtitle>

            <TitleSelect>Loja</TitleSelect>
            <SelectComponent
              title="Selecionar Loja"
              options={STORE_NAMES}
              action={handleSelectStore}
              clear={!selectedStore}
            />

            <TitleSelect>Cidades</TitleSelect>
            <SelectComponent
              title="Selecionar Cidades"
              options={cityOptions}
              action={setSelectedCities}
              multipleSelect
              disabled={!selectedStore}
            />

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
              />
            )}
          </>
        )}

        {/* Tags dos CPFs selecionados */}
        <TitleTags>Participantes Selecionados</TitleTags>
        {selectedCpfs.length === 0 ? (
          <Subtitle>Nenhum participante selecionado</Subtitle>
        ) : (
          <Scroll>
            <ContentTags>
              {selectedCpfs.map((cpf, index) => (
                <ContentTagParticipant key={`${cpf}-${index}`}>
                  <TagParticipant>{cpf}</TagParticipant>
                  <ButtonRemoveTag
                    onPress={() => setSelectedCpfs(prev => prev.filter(c => c !== cpf))}
                  >
                    <FontAwesome name="remove" size={18} color="white" />
                  </ButtonRemoveTag>
                </ContentTagParticipant>
              ))}
            </ContentTags>
          </Scroll>
        )}

      </Content>

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

    </Container>
  )
}