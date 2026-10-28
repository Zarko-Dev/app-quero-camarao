const { findUserMismatches } = require("./reconcileUsers");

test("finds Auth-only, Firestore-only and uid mismatch records", () => {
    const result = findUserMismatches(
        [
            { uid: "uid-ok", email: "ok@example.com" },
            { uid: "uid-orphan", email: "orphan@example.com" },
            { uid: "uid-new", email: "changed@example.com" },
        ],
        [
            { email: "ok@example.com", authUid: "uid-ok" },
            { email: "profile@example.com", authUid: "uid-profile" },
            { email: "changed@example.com", authUid: "uid-old" },
        ],
    );

    expect(result.authWithoutProfile).toEqual([{ email: "orphan@example.com", uid: "uid-orphan" }]);
    expect(result.profileWithoutAuth).toEqual([{ email: "profile@example.com", authUid: "uid-profile" }]);
    expect(result.uidMismatch).toEqual([
        { email: "changed@example.com", authUid: "uid-new", profileAuthUid: "uid-old" },
    ]);
});
