// Upload real para o Firebase Storage (RNFirebase):
//   storage().ref(path).putFile(localUri, { contentType }) + getDownloadURL().
// CommonJS para permitir teste direto via node --test injetando uma storage fake
// (mesmo padrão de chatAtomicWrite.js), exercitando o código real, não um mirror.
const performStorageUpload = async ({
    storage,
    chatId,
    kind,
    filename,
    localUri,
    contentType,
}) => {
    if (!storage) {
        throw new Error("performStorageUpload: storage não fornecido");
    }

    const storageRef = storage().ref(`chats/${chatId}/${kind}/${filename}`);
    await storageRef.putFile(localUri, { contentType });
    const url = await storageRef.getDownloadURL();

    return { error: false, url };
};

module.exports = { performStorageUpload };
