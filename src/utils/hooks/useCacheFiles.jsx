/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-template */
/* eslint-disable no-restricted-syntax */
import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";

// Hook para baixar e armazenar arquivos no cache
export const useCacheFiles = (filesLinks) => {
    const [cachedFiles, setCachedFiles] = useState({});

    useEffect(() => {
        const cacheFiles = async () => {
            const newCachedFiles = {};
            for (const file of filesLinks) {
                try {
                    const { imageUrl } = file;
                    const fileName = encodeURIComponent(imageUrl).replace(
                        /%2F/g,
                        "_",
                    );
                    const directory = `${FileSystem.cacheDirectory}ads_cache/`;

                    await FileSystem.makeDirectoryAsync(directory, {
                        intermediates: true,
                    });

                    const fileUri = directory + fileName;
                    const fileInfo = await FileSystem.getInfoAsync(fileUri);

                    if (!fileInfo.exists) {
                        console.log(`🔽 Baixando arquivo: ${imageUrl}`);
                        const { uri } = await FileSystem.downloadAsync(
                            imageUrl,
                            fileUri,
                        );
                        newCachedFiles[imageUrl] = uri;
                    } else {
                        newCachedFiles[imageUrl] = fileInfo.uri;
                    }
                } catch (error) {
                    console.error("❌ Erro ao baixar arquivo:", error);
                }
            }
            setCachedFiles(newCachedFiles);
        };

        cacheFiles();
    }, [filesLinks]);

    return cachedFiles;
};
