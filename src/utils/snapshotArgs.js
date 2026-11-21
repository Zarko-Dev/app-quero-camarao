// @react-native-firebase trata um único callback em onSnapshot como
// (snapshot, error): quando a regra nega o listener ele chama
// callback(null, error) e `snap.docs` / `snap.exists()` derrubam o app.
// Com dois callbacks vira onNext/onError e onNext nunca recebe null.
// Acrescenta um onError quando só o onNext foi passado.
const withSnapshotErrorHandler = (args, fallbackOnError) => {
    const fns = args.filter((a) => typeof a === "function");
    return fns.length === 1 ? [...args, fallbackOnError] : args;
};

module.exports = { withSnapshotErrorHandler };
