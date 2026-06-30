# Chat Auto-Send Message Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ao clicar no botão CHAT em um anúncio, enviar automaticamente a mensagem `"Olá {nome_produtor}, vi seu anuncio {localização} ainda está disponível? Tenho interesse!!"` — sem pré-preenchimento, direto enviada.

**Architecture:** `CardPublicationShrimp` passa `initialMessage` + `autoSend: true` via route.params. `PublicationChat` detecta `autoSend` e, quando `myId` fica disponível (via `useEffect([myId])`), chama `sendChatMessage` uma única vez via `autoSentRef` (guard para evitar duplo envio).

**Status:** ✅ IMPLEMENTADO em 2026-06-16

**Tech Stack:** React Native, React Navigation, Firebase

---

## Files Changed

- `src/components/CardPublicationShrimp/index.jsx` — fn `openChat()` com `initialMessage` + `autoSend: true`; ambos os navigate calls (botão inline + ModalShrimpImages) usam `openChat()`
- `src/pages/PublicationChat/index.jsx` — aceita `initialMessage`/`autoSend` de `route.params`; `autoSentRef` guard; `useEffect([myId])` dispara `sendChatMessage` uma vez

---

## Notas de implementação

- `resolvedSellerName` pode estar vazio quando `myId` resolve (fetch assíncrono do Firestore). Usa `resolvedSellerName || sellerName || ""` como fallback.
- `autoSentRef.current = true` antes do await → sem double-send mesmo se myId mudar.
- Campo de input `text` fica vazio (usuário vê chat já com mensagem enviada).
