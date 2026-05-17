/* eslint-disable react/no-unescaped-entities */
import {
    Container,
    Content,
    ContentItem,
    Divider,
    DotItem,
    LogoImage,
    Paragraph,
    TextItem,
    TextObservation,
    Title,
} from "./styles";

import originalLogo from "../../assets/images/originalLogo.png";

export const ParagraphItem = ({ children }) => (
    <ContentItem>
        <DotItem />
        <TextItem>{children}</TextItem>
    </ContentItem>
);

export const UseTerms = () => (
    <Container>
        <Content>
            <LogoImage source={originalLogo} />

            <Paragraph>
                Bem-vindo ao nosso aplicativo de anúncios! Antes de utilizar
                nossa plataforma, leia atentamente estes termos de uso, pois
                eles estabelecem as condições que você concorda em cumprir ao
                utilizar nosso serviço.
            </Paragraph>
            <Paragraph>
                Ao utilizar nosso aplicativo, você concorda com os termos e com
                as políticas de privacidade apresentadas.
            </Paragraph>

            <Title>Definições</Title>
            <Divider />

            <Paragraph>
                Para os fins de utilização dessa ferramenta, os seguintes termos
                terão os significados indicados abaixo:
            </Paragraph>
            <ParagraphItem>
                "Aplicativo" refere-se ao nosso aplicativo de anúncios.
            </ParagraphItem>
            <ParagraphItem>
                "Usuário" refere-se a qualquer pessoa que utilize o aplicativo
                para buscar e comprar produtos.
            </ParagraphItem>
            <ParagraphItem>
                "Anunciante" refere-se a qualquer pessoa ou empresa que publica
                um anúncio no aplicativo.
            </ParagraphItem>
            <ParagraphItem>
                "Anúncio" refere-se a qualquer conteúdo publicado por um
                anunciante no aplicativo, incluindo imagens, textos, vídeos e
                outros materiais promocionais.
            </ParagraphItem>
            <ParagraphItem>
                "Plataforma" refere-se à infraestrutura de tecnologia do
                aplicativo que permite a publicação e visualização de anúncios.
            </ParagraphItem>
            <ParagraphItem>
                "Serviço" refere-se ao conjunto de funcionalidades
                disponibilizadas pelo aplicativo, incluindo a publicação e
                visualização de anúncios.
            </ParagraphItem>

            <Title>Uso do Aplicativo</Title>
            <Divider />

            <Paragraph>
                O uso do aplicativo Corretora Camarão e Cia. LTDA., inscrita no
                CNPJ de n. 46.645.705/0001-67, é gratuito para os usuários que
                buscam adquirir produtos anunciados pelos anunciantes. Os
                anunciantes, por sua vez, deverão pagar uma taxa definida,
                sujeito a alterações posteriores, (sem aviso prévio), para
                publicar anúncios no aplicativo.
            </Paragraph>

            <Paragraph>
                <TextObservation>Obs.</TextObservation> Poderão ser apresentadas
                e retiradas promoções, ao livre convencimento do aplicativo.
            </Paragraph>

            <Paragraph>
                Ao utilizar o aplicativo, os usuários concordam em cumprir as
                seguintes regras:
            </Paragraph>

            <ParagraphItem>
                Não utilizar o aplicativo para fins ilegais ou que violem estes
                termos de uso ou qualquer lei aplicável.
            </ParagraphItem>
            <ParagraphItem>
                Não interferir no funcionamento do aplicativo ou tentar acessar
                áreas restritas sem autorização.
            </ParagraphItem>
            <ParagraphItem>
                A legislação brasileira que embasa esses termos de uso é o
                Código Civil Brasileiro, Lei nÂº 10.406/2002, que estabelece em
                seu artigo 421 que "a liberdade de contratar será exercida em
                razão e nos limites da função social do contrato". Ou seja, a
                utilização do aplicativo é uma forma de contrato entre o
                anunciante e o aplicativo, e deve respeitar os limites da função
                social do contrato, que é a de possibilitar a realização de
                negócios de forma justa e equilibrada entre as partes.
            </ParagraphItem>
            <ParagraphItem>
                A Quero Camarão não se responsabiliza pelas negociações de
                compra e venda entre o produtor e o cliente, pois todas as
                negociações são realizadas fora do aplicativo Quero Camarão.
            </ParagraphItem>
            {/* <ParagraphItem>
                As promoções ofertadas pela Quero Camarão são limitadas e
                poderão ser encerradas mediante decisão do mantedor
                (Administrador) do aplicativo.
            </ParagraphItem> */}

            <Title>Programa de Indicações - Quero Camarao</Title>
            <Divider />

            <Paragraph>
                Para participar do programa de indicações, você deve ser um
                usuário registrado do Quero Camarao.
            </Paragraph>

            <Paragraph>
                Ao indicar alguém para o Quero Camarao, o indicado receberá
                automaticamente R$60 de crédito para usar na sua primeira
                publicação. A pessoa que fez a indicação ganhará R$120 após a
                primeira indicação bem-sucedida. Para as próximas indicações
                feitas pelo mesmo usuário, a recompensa será de R$10 para quem
                indica.
            </Paragraph>

            <Paragraph>
                Importante: O crédito de R$120 ou R$10 para quem indica só será
                concedido quando o indicado realizar o pagamento.
            </Paragraph>

            <Paragraph>Condições Gerais</Paragraph>

            <ParagraphItem>
                O programa de indicações é válido apenas para novos usuários que
                não tenham uma conta no Quero Camarao.
            </ParagraphItem>

            <ParagraphItem>
                Qualquer uso de métodos fraudulentos resultará na
                desqualificação do programa de indicações.
            </ParagraphItem>

            <ParagraphItem>
                O Quero Camarao reserva o direito de encerrar o programa de
                indicações a qualquer momento, sem aviso prévio.
            </ParagraphItem>

            <ParagraphItem>
                Os créditos recebidos não podem ser transferidos ou resgatados
                por dinheiro.
            </ParagraphItem>

            <Paragraph>
                Ao participar do programa de indicações, você concorda com estes
                termos e condições.
            </Paragraph>

            <Title>Publicação de Anúncios</Title>
            <Divider />

            <Paragraph>
                Qualquer pessoa ou empresa pode publicar um anúncio no
                aplicativo, desde que cumpra as seguintes regras:
            </Paragraph>

            <ParagraphItem>
                O aplicativo não se responsabilizará por negócios realizados ou
                não entre anunciante e usuário.
            </ParagraphItem>
            <ParagraphItem>
                O anúncio deve ser verdadeiro e não enganoso.
            </ParagraphItem>
            <ParagraphItem>
                O anúncio não pode promover produtos ou serviços ilegais ou
                ofensivos.
            </ParagraphItem>
            <ParagraphItem>
                O anúncio não pode infringir direitos autorais ou de propriedade
                intelectual de terceiros.
            </ParagraphItem>
            <ParagraphItem>
                O anúncio não pode conter informações pessoais ou sensíveis de
                terceiros.
            </ParagraphItem>
            <ParagraphItem>
                O anunciante é responsável por garantir que o anúncio cumpra
                todas as leis e regulamentações aplicáveis.
            </ParagraphItem>
            <ParagraphItem>
                A legislação que embasa essa contratação estão estabelecidas no
                art. 30 Código de Defesa do Consumidor, Lei nÂº 8.078 de 1990.
            </ParagraphItem>
        </Content>
    </Container>
);
