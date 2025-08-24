#! /bin/bash

GREEN='\033[0;32m'
NC='\033[0m'
PS3="Select shape to change version: "

select lng in Automatic Manually Exit

do
    case $lng in
        "Automatic")
            CURRENT_PACKAGE_VERSION=$(node -p "require('./package.json').version")
            CURRENT_APP_VERSION=$(node -p "require('./app.json').expo.version")
            CURRENT_APP_VERSION_CODE=$(node -p "require('./app.json').expo.android.versionCode")

            IFS='.'

            read -ra arrayPackage <<< "$CURRENT_PACKAGE_VERSION"
            read -ra arrayApp <<< "$CURRENT_APP_VERSION"

            VERSION_PACKAGE_POSITION1=${arrayPackage[0]}
            VERSION_PACKAGE_POSITION2=${arrayPackage[1]}
            VERSION_PACKAGE_POSITION3=${arrayPackage[2]}

            VERSION_APP_POSITION1=${arrayApp[0]}
            VERSION_APP_POSITION2=${arrayApp[1]}
            VERSION_APP_POSITION3=${arrayApp[2]}

            if [ $VERSION_PACKAGE_POSITION3 -lt 100 ]; then
                VERSION_PACKAGE_POSITION3=$((${VERSION_PACKAGE_POSITION3} + 1))
            else
                VERSION_PACKAGE_POSITION3=0
                if [ $VERSION_PACKAGE_POSITION2 -lt 100 ]; then
                    VERSION_PACKAGE_POSITION2=$((${VERSION_PACKAGE_POSITION2} + 1))
                else
                    VERSION_PACKAGE_POSITION2=0
                    VERSION_PACKAGE_POSITION1=$((${VERSION_PACKAGE_POSITION1} + 1))
                fi
            fi

            if [ $VERSION_APP_POSITION3 -lt 100 ]; then
                VERSION_APP_POSITION3=$((${VERSION_APP_POSITION3} + 1))
            else
                VERSION_APP_POSITION3=0
                if [ $VERSION_APP_POSITION2 -lt 100 ]; then
                    VERSION_APP_POSITION2=$((${VERSION_APP_POSITION2} + 1))
                else
                    VERSION_APP_POSITION2=0
                    VERSION_APP_POSITION1=$((${VERSION_APP_POSITION1} + 1))
                fi
            fi

            NEW_PACKAGE_VERSION="${VERSION_PACKAGE_POSITION1}.${VERSION_PACKAGE_POSITION2}.${VERSION_PACKAGE_POSITION3}"
            NEW_APP_VERSION="${VERSION_APP_POSITION1}.${VERSION_APP_POSITION2}.${VERSION_APP_POSITION3}"
            NEW_APP_VERSION_CODE=$((${CURRENT_APP_VERSION_CODE} + 1))

            sed -i "s/\"version\": \"${CURRENT_PACKAGE_VERSION}\"/\"version\": \"${NEW_PACKAGE_VERSION}\"/" package.json
            sed -i "s/\"version\": \"${CURRENT_APP_VERSION}\"/\"version\": \"${NEW_APP_VERSION}\"/" app.json
            sed -i "s/\"versionCode\": ${CURRENT_APP_VERSION_CODE}/\"versionCode\": ${NEW_APP_VERSION_CODE}/" app.json
            sed -i "s/\"buildNumber\": \"${CURRENT_APP_VERSION_CODE}\"/\"buildNumber\": \"${NEW_APP_VERSION_CODE}\"/" app.json

            echo -e "\nNew Project Version ${GREEN}${NEW_PACKAGE_VERSION}${NC}"
            echo -e "New App Version ${GREEN}${NEW_APP_VERSION}${NC}"
            echo -e "New App Version Code ${GREEN}${NEW_APP_VERSION_CODE}${NC}"
            echo -e "New App Version Code IOS ${GREEN}${NEW_APP_VERSION_CODE}${NC}\n"

            exit;;
        "Manually")
            echo ""

            PS3="Select where update version: "

            select lng in package.json app.json All Exit

            do
                case $lng in
                    "package.json")
                        CURRENT_PACKAGE_VERSION=$(node -p "require('./package.json').version")
                        echo -e "\nCURRENT VERSION: ${GREEN}${CURRENT_PACKAGE_VERSION}${NC}\n"
                        echo "Set new version: "
                        read NEW_PACKAGE_VERSION
                        sed -i "s/\"version\": \"${CURRENT_PACKAGE_VERSION}\"/\"version\": \"${NEW_PACKAGE_VERSION}\"/" package.json
                        echo -e "\nNew Project Version ${GREEN}${NEW_PACKAGE_VERSION}${NC}"
                        exit;;
                    "app.json")
                        CURRENT_APP_VERSION=$(node -p "require('./app.json').expo.version")
                        CURRENT_APP_VERSION_CODE=$(node -p "require('./app.json').expo.android.versionCode")
                        NEW_APP_VERSION_CODE=$((${CURRENT_APP_VERSION_CODE} + 1))
                        echo -e "\nCURRENT VERSION: ${GREEN}${CURRENT_APP_VERSION}${NC}\n"
                        echo "Set new version: "
                        read NEW_APP_VERSION
                        sed -i "s/\"version\": \"${CURRENT_APP_VERSION}\"/\"version\": \"${NEW_APP_VERSION}\"/" app.json
                        sed -i "s/\"versionCode\": ${CURRENT_APP_VERSION_CODE}/\"versionCode\": ${NEW_APP_VERSION_CODE}/" app.json
                        sed -i "s/\"buildNumber\": \"${CURRENT_APP_VERSION_CODE}\"/\"buildNumber\": \"${NEW_APP_VERSION_CODE}\"/" app.json
                        echo -e "\nNew App Version ${GREEN}${NEW_APP_VERSION}${NC}"
                        echo -e "New App Version Code ${GREEN}${NEW_APP_VERSION_CODE}${NC}"
                        echo -e "New App Version Code IOS ${GREEN}${NEW_APP_VERSION_CODE}${NC}\n"
                        exit;;
                    "All")
                        CURRENT_PACKAGE_VERSION=$(node -p "require('./package.json').version")
                        CURRENT_APP_VERSION=$(node -p "require('./app.json').expo.version")
                        CURRENT_APP_VERSION_CODE=$(node -p "require('./app.json').expo.android.versionCode")
                        NEW_APP_VERSION_CODE=$((${CURRENT_APP_VERSION_CODE} + 1))
                        echo -e "\nCURRENT PACKAGE VERSION: ${GREEN}${CURRENT_PACKAGE_VERSION}${NC} / CURRENT APP VERSION: ${GREEN}${CURRENT_APP_VERSION}${NC}\n"
                        echo "Set new version: "
                        read NEW_VERSION
                        sed -i "s/\"version\": \"${CURRENT_PACKAGE_VERSION}\"/\"version\": \"${NEW_VERSION}\"/" package.json
                        sed -i "s/\"version\": \"${CURRENT_APP_VERSION}\"/\"version\": \"${NEW_VERSION}\"/" app.json
                        sed -i "s/\"versionCode\": ${CURRENT_APP_VERSION_CODE}/\"versionCode\": ${NEW_APP_VERSION_CODE}/" app.json
                        sed -i "s/\"buildNumber\": \"${CURRENT_APP_VERSION_CODE}\"/\"buildNumber\": \"${NEW_APP_VERSION_CODE}\"/" app.json
                        echo -e "\nNew Package and App Version ${GREEN}${NEW_VERSION}${NC}"
                        echo -e "New App Version Code ${GREEN}${NEW_APP_VERSION_CODE}${NC}"
                        echo -e "New App Version Code IOS ${GREEN}${NEW_APP_VERSION_CODE}${NC}\n"
                        exit;;
                    "Exit")
                        exit;;
                    *)
                        exit;;
                esac
            done;;
        "Exit")
            exit;;
        *)
            exit;;
    esac


    PS3="Change Version Code: "

    select lng in Yes No Exit

    do
        case $lng in
            "Yes")
                CURRENT_APP_VERSION_CODE=$(node -p "require('./app.json').expo.android.versionCode")
                NEW_APP_VERSION_CODE=$((${CURRENT_APP_VERSION_CODE} + 1))
                sed -i "s/\"versionCode\": ${CURRENT_APP_VERSION_CODE}/\"versionCode\": ${NEW_APP_VERSION_CODE}/" app.json
                echo -e "New App Version Code ${GREEN}${NEW_APP_VERSION_CODE}${NC}\n"

                exit;;
            "No")
                exit;;
            *)
                exit;;
        esac
    done

done
